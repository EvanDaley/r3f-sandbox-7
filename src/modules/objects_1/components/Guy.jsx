import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useBox, useConeTwistConstraint, useSphere, usePointToPointConstraint } from "@react-three/cannon";
import { createRagdoll } from "../helpers/createRagdoll";
import { useDragConstraint } from "../helpers/Drag.jsx";
import { getLimbReleaseCallback } from "../helpers/limbAttachmentBridge";
import { Block } from "../helpers/Block";
import { useFrame } from "@react-three/fiber";

const { shapes, joints } = createRagdoll(5.5, Math.PI / 16, Math.PI / 16, 0);
const context = createContext();

/** Limb names that can be stuck to grab targets (hands and feet). */
export const ATTACHABLE_LIMBS = ["lowerLeftArm", "lowerRightArm", "lowerLeftLeg", "lowerRightLeg"];

/** Endpoint pivot in local space (hand or foot) per attachable limb. */
const ENDPOINT_PIVOTS = {
  lowerLeftArm: (args) => [-args[0] / 2, 0, 0],
  lowerRightArm: (args) => [args[0] / 2, 0, 0],
  lowerLeftLeg: (args) => [0, -args[1] / 2, 0],
  lowerRightLeg: (args) => [0, -args[1] / 2, 0],
};

const BodyPart = ({ config, children, render, name, ...props }) => {
  const { color, args, mass, position } = shapes[name];
  const parent = useContext(context);
  const [ref] = useBox(() => ({ mass, args, position, linearDamping: 0.99, ...props }));
  useConeTwistConstraint(ref, parent, config);
  const bind = useDragConstraint(ref);
  return (
    <context.Provider value={ref}>
      <Block castShadow receiveShadow ref={ref} {...props} {...bind} scale={args} name={name} color={color}>
        {render}
      </Block>
      {children}
    </context.Provider>
  );
};

/**
 * Body part that can optionally be fixed to a world position (anchor).
 * When attachmentPosition is set, a constraint holds this limb's endpoint to that spot.
 */
const AttachableLimb = ({
  config,
  children,
  render,
  name,
  anchorRef,
  attachmentPosition,
  ...props
}) => {
  const { color, args, mass, position } = shapes[name];
  const parent = useContext(context);
  const [ref] = useBox(() => ({ mass, args, position, linearDamping: 0.99, ...props }));
  useConeTwistConstraint(ref, parent, config);
  const pivotB = ENDPOINT_PIVOTS[name](args);
  const [, , constraintApi] = usePointToPointConstraint(anchorRef, ref, {
    pivotA: [0, 0, 0],
    pivotB,
  });
  useEffect(() => {
    if (!attachmentPosition || attachmentPosition.length < 3) constraintApi.disable();
  }, [attachmentPosition, constraintApi]);
  useEffect(() => {
    if (attachmentPosition && attachmentPosition.length >= 3) constraintApi.enable();
    else constraintApi.disable();
  }, [attachmentPosition, constraintApi]);

  const bind = useDragConstraint(ref);
  const onPointerUp = (e) => {
    bind.onPointerUp(e);
    const cb = getLimbReleaseCallback();
    if (cb && ref.current) {
      const v = new THREE.Vector3();
      ref.current.getWorldPosition(v);
      cb(name, [v.x, v.y, v.z]);
    }
  };
  return (
    <context.Provider value={ref}>
      <Block castShadow receiveShadow ref={ref} {...props} {...bind} onPointerUp={onPointerUp} scale={args} name={name} color={color}>
        {render}
      </Block>
      {children}
    </context.Provider>
  );
};

function Face() {
  const mouth = useRef();
  const eyes = useRef();
  useFrame((state) => {
    eyes.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    mouth.current.scale.y = (1 + Math.sin(state.clock.elapsedTime * 2)) * 0.6;
  });
  return (
    <>
      <group ref={eyes}>
        <Block position={[-0.3, 0.1, 0.5]} args={[0.2, 0.1, 0.1]} color="black" transparent opacity={0.8} />
        <Block position={[0.3, 0.1, 0.5]} args={[0.2, 0.1, 0.1]} color="black" transparent opacity={0.8} />
      </group>
      <Block ref={mouth} position={[0, -0.2, 0.5]} args={[0.3, 0.05, 0.1]} color="#700000" transparent opacity={0.8} />
    </>
  );
}

export function Guy(props) {
  const {
    attachments = {},
    animationMode = "ragdoll",
    rifleActive = false,
    isFiring = false,
    ...rest
  } = props;

  const [anchor1Ref, anchor1Api] = useSphere(() => ({
    type: "Kinematic",
    mass: 0,
    args: [0.01],
    collisionFilterGroup: 0,
    collisionFilterMask: 0,
  }));
  const [anchor2Ref, anchor2Api] = useSphere(() => ({
    type: "Kinematic",
    mass: 0,
    args: [0.01],
    collisionFilterGroup: 0,
    collisionFilterMask: 0,
  }));
  const [anchor3Ref, anchor3Api] = useSphere(() => ({
    type: "Kinematic",
    mass: 0,
    args: [0.01],
    collisionFilterGroup: 0,
    collisionFilterMask: 0,
  }));
  const [anchor4Ref, anchor4Api] = useSphere(() => ({
    type: "Kinematic",
    mass: 0,
    args: [0.01],
    collisionFilterGroup: 0,
    collisionFilterMask: 0,
  }));

  const anchorRefs = {
    lowerLeftArm: anchor1Ref,
    lowerRightArm: anchor2Ref,
    lowerLeftLeg: anchor3Ref,
    lowerRightLeg: anchor4Ref,
  };
  const anchorApis = [anchor1Api, anchor2Api, anchor3Api, anchor4Api];
  const limbKeys = ATTACHABLE_LIMBS;

  const proceduralTargetsRef = useRef({
    lowerLeftArm: null,
    lowerRightArm: null,
    lowerLeftLeg: null,
    lowerRightLeg: null,
  });

  const effectiveAttachments = useMemo(() => {
    const output = {};
    ATTACHABLE_LIMBS.forEach((key) => {
      output[key] = attachments[key] ?? proceduralTargetsRef.current[key] ?? null;
    });
    return output;
  }, [
    attachments.lowerLeftArm,
    attachments.lowerRightArm,
    attachments.lowerLeftLeg,
    attachments.lowerRightLeg,
    animationMode,
    rifleActive,
    isFiring,
  ]);

  useEffect(() => {
    limbKeys.forEach((key, i) => {
      const pos = effectiveAttachments[key];
      if (pos && Array.isArray(pos) && pos.length >= 3) {
        anchorApis[i].position.set(pos[0], pos[1], pos[2]);
      }
    });
  }, [
    effectiveAttachments.lowerLeftArm,
    effectiveAttachments.lowerRightArm,
    effectiveAttachments.lowerLeftLeg,
    effectiveAttachments.lowerRightLeg,
  ]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const gait = Math.sin(t * 4.4);
    const antiGait = Math.sin(t * 4.4 + Math.PI);
    const bounce = Math.abs(Math.sin(t * 8.8));
    const firePulse = isFiring ? Math.sin(t * 50) * 0.18 : 0;
    const baseHeight = 2.95;

    const walkEnabled = animationMode === "walk";
    const aimEnabled = rifleActive;

    const walkTargets = {
      lowerLeftLeg: [-0.9, baseHeight + bounce * 0.2, 0.5 + gait * 1.1],
      lowerRightLeg: [0.9, baseHeight + (1 - bounce) * 0.2, 0.5 + antiGait * 1.1],
      lowerLeftArm: [-2.6, 7.4 + antiGait * 0.2, -0.3 + antiGait * 0.9],
      lowerRightArm: [2.6, 7.4 + gait * 0.2, -0.3 + gait * 0.9],
    };

    const rifleTargets = {
      lowerLeftArm: [-0.7, 7.2, 2.2 + firePulse * -0.6],
      lowerRightArm: [1.15, 7.35, 1.5 + firePulse * -0.35],
      lowerLeftLeg: [-0.75, 2.95 + bounce * 0.1, 0.25 + gait * 0.25],
      lowerRightLeg: [0.75, 2.95 + (1 - bounce) * 0.1, 0.15 + antiGait * 0.25],
    };

    if (walkEnabled || aimEnabled) {
      const targets = aimEnabled ? rifleTargets : walkTargets;
      ATTACHABLE_LIMBS.forEach((key, i) => {
        if (!attachments[key]) {
          const next = targets[key];
          proceduralTargetsRef.current[key] = next;
          anchorApis[i].position.set(next[0], next[1], next[2]);
        }
      });
    } else {
      ATTACHABLE_LIMBS.forEach((key) => {
        proceduralTargetsRef.current[key] = null;
      });
    }
  });

  const muzzleFlashScale = isFiring ? 0.35 : 0.001;

  return (
    <>
      <group ref={anchor1Ref} />
      <group ref={anchor2Ref} />
      <group ref={anchor3Ref} />
      <group ref={anchor4Ref} />
      {rifleActive && (
        <group position={[0.3, 7.25, 1.95]} rotation={[0, -0.06, 0.12]}>
          <Block args={[2.5, 0.18, 0.18]} color="#2a2a2a" />
          <Block position={[0.95, 0.1, 0]} args={[0.65, 0.24, 0.22]} color="#3b3b3b" />
          <Block position={[-1, -0.18, 0]} args={[0.26, 0.36, 0.2]} color="#1f1f1f" />
          <Block position={[1.35, 0, 0]} args={[0.24, 0.14, 0.14]} color="#1a1a1a" />
          <pointLight position={[1.55, 0, 0]} color="#ffb347" intensity={isFiring ? 5 : 0} distance={3} decay={2} />
          <mesh position={[1.62, 0, 0]} scale={[muzzleFlashScale, muzzleFlashScale, muzzleFlashScale]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#ffe29a" transparent opacity={0.85} />
          </mesh>
        </group>
      )}
      <BodyPart name="upperBody" {...rest}>
        <BodyPart {...rest} name="head" config={joints["neckJoint"]} render={<Face />} />
        <BodyPart {...rest} name="upperLeftArm" config={joints["leftShoulder"]}>
          <AttachableLimb
            {...rest}
            name="lowerLeftArm"
            config={joints["leftElbowJoint"]}
            anchorRef={anchorRefs.lowerLeftArm}
            attachmentPosition={effectiveAttachments.lowerLeftArm}
          />
        </BodyPart>
        <BodyPart {...rest} name="upperRightArm" config={joints["rightShoulder"]}>
          <AttachableLimb
            {...rest}
            name="lowerRightArm"
            config={joints["rightElbowJoint"]}
            anchorRef={anchorRefs.lowerRightArm}
            attachmentPosition={effectiveAttachments.lowerRightArm}
          />
        </BodyPart>
        <BodyPart {...rest} name="pelvis" config={joints["spineJoint"]}>
          <BodyPart {...rest} name="upperLeftLeg" config={joints["leftHipJoint"]}>
            <AttachableLimb
              {...rest}
              name="lowerLeftLeg"
              config={joints["leftKneeJoint"]}
              anchorRef={anchorRefs.lowerLeftLeg}
              attachmentPosition={effectiveAttachments.lowerLeftLeg}
            />
          </BodyPart>
          <BodyPart {...rest} name="upperRightLeg" config={joints["rightHipJoint"]}>
            <AttachableLimb
              {...rest}
              name="lowerRightLeg"
              config={joints["rightKneeJoint"]}
              anchorRef={anchorRefs.lowerRightLeg}
              attachmentPosition={effectiveAttachments.lowerRightLeg}
            />
          </BodyPart>
        </BodyPart>
      </BodyPart>
    </>
  );
}
