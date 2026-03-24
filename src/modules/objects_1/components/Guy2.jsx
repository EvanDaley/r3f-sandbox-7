import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useBox, useConeTwistConstraint, usePointToPointConstraint, useSphere } from "@react-three/cannon";
import { createRagdoll } from "../helpers/createRagdoll";
import { useDragConstraint } from "../helpers/Drag.jsx";
import { getLimbReleaseCallback } from "../helpers/limbAttachmentBridge";
import { Block } from "../helpers/Block";

const { shapes, joints } = createRagdoll(5.5, Math.PI / 16, Math.PI / 16, 0);
const context = createContext();

export const ATTACHABLE_LIMBS_GUY2 = ["lowerLeftArm", "lowerRightArm", "lowerLeftLeg", "lowerRightLeg"];

const ENDPOINT_PIVOTS = {
  lowerLeftArm: (args) => [-args[0] / 2, 0, 0],
  lowerRightArm: (args) => [args[0] / 2, 0, 0],
  lowerLeftLeg: (args) => [0, -args[1] / 2, 0],
  lowerRightLeg: (args) => [0, -args[1] / 2, 0],
};

const STANDUP_IDLE_SECONDS = 1.2;
const BALANCE_HEIGHT = 5.7;
const UPRIGHT_FORCE = 3200;
const CENTERING_FORCE = 1200;

const BodyPart = ({ config, children, render, name, registerPart, dragStateRef, ...props }) => {
  const { color, args, mass, position } = shapes[name];
  const parent = useContext(context);
  const [ref, api] = useBox(() => ({ mass, args, position, linearDamping: 0.99, ...props }));
  useConeTwistConstraint(ref, parent, config);

  useEffect(() => {
    registerPart?.(name, { ref, api, args });
  }, [api, args, name, ref, registerPart]);

  const bind = useDragConstraint(ref, {
    onDragStart: () => {
      dragStateRef.current = true;
    },
    onDragEnd: () => {
      dragStateRef.current = false;
    },
  });

  return (
    <context.Provider value={ref}>
      <Block castShadow receiveShadow ref={ref} {...props} {...bind} scale={args} name={name} color={color}>
        {render}
      </Block>
      {children}
    </context.Provider>
  );
};

const AttachableLimb = ({
  config,
  children,
  render,
  name,
  anchorRef,
  attachmentPosition,
  registerPart,
  dragStateRef,
  ...props
}) => {
  const { color, args, mass, position } = shapes[name];
  const parent = useContext(context);
  const [ref, api] = useBox(() => ({ mass, args, position, linearDamping: 0.99, ...props }));
  useConeTwistConstraint(ref, parent, config);

  useEffect(() => {
    registerPart?.(name, { ref, api, args });
  }, [api, args, name, ref, registerPart]);

  const pivotB = ENDPOINT_PIVOTS[name](args);
  const [, , constraintApi] = usePointToPointConstraint(anchorRef, ref, {
    pivotA: [0, 0, 0],
    pivotB,
  });

  useEffect(() => {
    if (attachmentPosition && attachmentPosition.length >= 3) constraintApi.enable();
    else constraintApi.disable();
  }, [attachmentPosition, constraintApi]);

  const bind = useDragConstraint(ref, {
    onDragStart: () => {
      dragStateRef.current = true;
    },
    onDragEnd: () => {
      dragStateRef.current = false;
    },
  });

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
    if (!eyes.current || !mouth.current) return;
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

export function Guy2(props) {
  const { attachments = {}, ...rest } = props;

  const dragStateRef = useRef(false);
  const idleTimeRef = useRef(0);
  const partsRef = useRef({});
  const positionsRef = useRef({});
  const velocitiesRef = useRef({});

  const registerPart = useCallback((name, part) => {
    if (partsRef.current[name]) return;
    partsRef.current[name] = part;
    part.api.position.subscribe((value) => {
      positionsRef.current[name] = value;
    });
    part.api.velocity.subscribe((value) => {
      velocitiesRef.current[name] = value;
    });
  }, []);

  const [anchor1Ref, anchor1Api] = useSphere(() => ({ type: "Kinematic", mass: 0, args: [0.01], collisionFilterGroup: 0, collisionFilterMask: 0 }));
  const [anchor2Ref, anchor2Api] = useSphere(() => ({ type: "Kinematic", mass: 0, args: [0.01], collisionFilterGroup: 0, collisionFilterMask: 0 }));
  const [anchor3Ref, anchor3Api] = useSphere(() => ({ type: "Kinematic", mass: 0, args: [0.01], collisionFilterGroup: 0, collisionFilterMask: 0 }));
  const [anchor4Ref, anchor4Api] = useSphere(() => ({ type: "Kinematic", mass: 0, args: [0.01], collisionFilterGroup: 0, collisionFilterMask: 0 }));

  const anchorRefs = useMemo(
    () => ({
      lowerLeftArm: anchor1Ref,
      lowerRightArm: anchor2Ref,
      lowerLeftLeg: anchor3Ref,
      lowerRightLeg: anchor4Ref,
    }),
    [anchor1Ref, anchor2Ref, anchor3Ref, anchor4Ref]
  );

  const anchorApis = [anchor1Api, anchor2Api, anchor3Api, anchor4Api];

  useEffect(() => {
    ATTACHABLE_LIMBS_GUY2.forEach((key, i) => {
      const pos = attachments[key];
      if (pos && Array.isArray(pos) && pos.length >= 3) {
        anchorApis[i].position.set(pos[0], pos[1], pos[2]);
      }
    });
  }, [anchorApis, attachments]);

  useFrame((_, delta) => {
    const isAttached = ATTACHABLE_LIMBS_GUY2.some((key) => Boolean(attachments[key]));
    if (!dragStateRef.current && !isAttached) idleTimeRef.current += delta;
    else idleTimeRef.current = 0;

    if (idleTimeRef.current < STANDUP_IDLE_SECONDS) return;

    const pelvis = partsRef.current.pelvis;
    const upperBody = partsRef.current.upperBody;
    if (!pelvis || !upperBody) return;

    const pelvisPos = positionsRef.current.pelvis;
    const upperPos = positionsRef.current.upperBody;
    if (!pelvisPos || !upperPos) return;

    const centerX = (pelvisPos[0] + upperPos[0]) * 0.5;
    const centerZ = (pelvisPos[2] + upperPos[2]) * 0.5;

    const pelvisLift = Math.max(0, BALANCE_HEIGHT - pelvisPos[1]);
    pelvis.api.applyForce([0, pelvisLift * UPRIGHT_FORCE, 0], [0, 0, 0]);
    upperBody.api.applyForce([0, pelvisLift * UPRIGHT_FORCE * 0.9, 0], [0, 0, 0]);

    const upperVel = velocitiesRef.current.upperBody ?? [0, 0, 0];
    const sideDampingX = -upperVel[0] * 450;
    const sideDampingZ = -upperVel[2] * 450;
    upperBody.api.applyForce([sideDampingX, 0, sideDampingZ], [0, 0, 0]);

    ["upperLeftLeg", "upperRightLeg"].forEach((legName) => {
      const leg = partsRef.current[legName];
      const legPos = positionsRef.current[legName];
      if (!leg || !legPos) return;
      const dx = centerX - legPos[0];
      const dz = centerZ - legPos[2];
      leg.api.applyForce([dx * CENTERING_FORCE, 0, dz * CENTERING_FORCE], [0, 0, 0]);
    });
  });

  return (
    <>
      <group ref={anchor1Ref} />
      <group ref={anchor2Ref} />
      <group ref={anchor3Ref} />
      <group ref={anchor4Ref} />
      <BodyPart name="upperBody" registerPart={registerPart} dragStateRef={dragStateRef} {...rest}>
        <BodyPart {...rest} name="head" registerPart={registerPart} dragStateRef={dragStateRef} config={joints.neckJoint} render={<Face />} />
        <BodyPart {...rest} name="upperLeftArm" registerPart={registerPart} dragStateRef={dragStateRef} config={joints.leftShoulder}>
          <AttachableLimb
            {...rest}
            name="lowerLeftArm"
            registerPart={registerPart}
            dragStateRef={dragStateRef}
            config={joints.leftElbowJoint}
            anchorRef={anchorRefs.lowerLeftArm}
            attachmentPosition={attachments.lowerLeftArm}
          />
        </BodyPart>
        <BodyPart {...rest} name="upperRightArm" registerPart={registerPart} dragStateRef={dragStateRef} config={joints.rightShoulder}>
          <AttachableLimb
            {...rest}
            name="lowerRightArm"
            registerPart={registerPart}
            dragStateRef={dragStateRef}
            config={joints.rightElbowJoint}
            anchorRef={anchorRefs.lowerRightArm}
            attachmentPosition={attachments.lowerRightArm}
          />
        </BodyPart>
        <BodyPart {...rest} name="pelvis" registerPart={registerPart} dragStateRef={dragStateRef} config={joints.spineJoint}>
          <BodyPart {...rest} name="upperLeftLeg" registerPart={registerPart} dragStateRef={dragStateRef} config={joints.leftHipJoint}>
            <AttachableLimb
              {...rest}
              name="lowerLeftLeg"
              registerPart={registerPart}
              dragStateRef={dragStateRef}
              config={joints.leftKneeJoint}
              anchorRef={anchorRefs.lowerLeftLeg}
              attachmentPosition={attachments.lowerLeftLeg}
            />
          </BodyPart>
          <BodyPart {...rest} name="upperRightLeg" registerPart={registerPart} dragStateRef={dragStateRef} config={joints.rightHipJoint}>
            <AttachableLimb
              {...rest}
              name="lowerRightLeg"
              registerPart={registerPart}
              dragStateRef={dragStateRef}
              config={joints.rightKneeJoint}
              anchorRef={anchorRefs.lowerRightLeg}
              attachmentPosition={attachments.lowerRightLeg}
            />
          </BodyPart>
        </BodyPart>
      </BodyPart>
    </>
  );
}
