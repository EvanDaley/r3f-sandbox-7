import { useAnimations, useGLTF } from "@react-three/drei";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const DEFAULT_ANIMATION = "Idle";

export const TASK_ANIMATION_BY_SKILL = Object.freeze({
  woodcutting: "Attack(1h)",
  mining: "Attack(1h)",
  crafting: "Cheer",
  combat: "Attack(1h)",
});

const RpgPlayerCharacter = forwardRef(function RpgPlayerCharacter(
  { animationName = DEFAULT_ANIMATION, ...props },
  forwardedRef
) {
  const groupRef = useRef();
  const { scene, animations } = useGLTF("./models/third_person_controller/Floating Character.glb");
  const characterScene = useMemo(() => scene.clone(), [scene]);
  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    if (!forwardedRef) {
      return;
    }

    if (typeof forwardedRef === "function") {
      forwardedRef(groupRef.current);
      return;
    }

    forwardedRef.current = groupRef.current;
  }, [forwardedRef]);

  useEffect(() => {
    const nextAction = actions[animationName] ?? actions[DEFAULT_ANIMATION];

    if (!nextAction) {
      return undefined;
    }

    const onceAnimations = new Set(["Cheer", "Wave", "Attack(1h)"]);
    nextAction.reset();
    nextAction.fadeIn(0.18);

    if (onceAnimations.has(animationName)) {
      nextAction.setLoop(THREE.LoopOnce, 1);
      nextAction.clampWhenFinished = true;
    } else {
      nextAction.setLoop(THREE.LoopRepeat, Infinity);
      nextAction.clampWhenFinished = false;
    }

    nextAction.play();

    return () => {
      nextAction.fadeOut(0.18);
    };
  }, [actions, animationName]);

  return (
    <group ref={groupRef} {...props}>
      <primitive object={characterScene} scale={0.8} position={[0, -0.6, 0]} />
    </group>
  );
});

export default RpgPlayerCharacter;

useGLTF.preload("./models/third_person_controller/Floating Character.glb");
