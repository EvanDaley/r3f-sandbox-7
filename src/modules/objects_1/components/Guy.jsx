import { createContext, useContext, useEffect, useRef } from "react";
import * as THREE from "three";
import { useBox, useConeTwistConstraint, useSphere, usePointToPointConstraint } from "@react-three/cannon";
import { createRagdoll } from "../helpers/createRagdoll";
import { useDragConstraint } from "../helpers/Drag";
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
  const { attachments = {}, ...rest } = props;

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

  useEffect(() => {
    limbKeys.forEach((key, i) => {
      const pos = attachments[key];
      if (pos && Array.isArray(pos) && pos.length >= 3) {
        anchorApis[i].position.set(pos[0], pos[1], pos[2]);
      }
    });
  }, [attachments.lowerLeftArm, attachments.lowerRightArm, attachments.lowerLeftLeg, attachments.lowerRightLeg]);

  return (
    <>
      <group ref={anchor1Ref} />
      <group ref={anchor2Ref} />
      <group ref={anchor3Ref} />
      <group ref={anchor4Ref} />
      <BodyPart name="upperBody" {...rest}>
        <BodyPart {...rest} name="head" config={joints["neckJoint"]} render={<Face />} />
        <BodyPart {...rest} name="upperLeftArm" config={joints["leftShoulder"]}>
          <AttachableLimb
            {...rest}
            name="lowerLeftArm"
            config={joints["leftElbowJoint"]}
            anchorRef={anchorRefs.lowerLeftArm}
            attachmentPosition={attachments.lowerLeftArm}
          />
        </BodyPart>
        <BodyPart {...rest} name="upperRightArm" config={joints["rightShoulder"]}>
          <AttachableLimb
            {...rest}
            name="lowerRightArm"
            config={joints["rightElbowJoint"]}
            anchorRef={anchorRefs.lowerRightArm}
            attachmentPosition={attachments.lowerRightArm}
          />
        </BodyPart>
        <BodyPart {...rest} name="pelvis" config={joints["spineJoint"]}>
          <BodyPart {...rest} name="upperLeftLeg" config={joints["leftHipJoint"]}>
            <AttachableLimb
              {...rest}
              name="lowerLeftLeg"
              config={joints["leftKneeJoint"]}
              anchorRef={anchorRefs.lowerLeftLeg}
              attachmentPosition={attachments.lowerLeftLeg}
            />
          </BodyPart>
          <BodyPart {...rest} name="upperRightLeg" config={joints["rightHipJoint"]}>
            <AttachableLimb
              {...rest}
              name="lowerRightLeg"
              config={joints["rightKneeJoint"]}
              anchorRef={anchorRefs.lowerRightLeg}
              attachmentPosition={attachments.lowerRightLeg}
            />
          </BodyPart>
        </BodyPart>
      </BodyPart>
    </>
  );
}
