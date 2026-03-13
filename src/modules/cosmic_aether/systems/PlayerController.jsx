import { useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { Vector3 } from "three";

const KEY_MAP = {
  forward: ["KeyW", "ArrowUp"],
  backward: ["KeyS", "ArrowDown"],
  left: ["KeyA", "ArrowLeft"],
  right: ["KeyD", "ArrowRight"],
  up: ["Space", "KeyE"],
  down: ["ShiftLeft", "KeyQ"],
  glide: ["ShiftRight"],
};

export default function PlayerController({ speed = 9, floatDrag = 0.9, bounds = 65 }) {
  const { camera, gl } = useThree();
  const velocity = useRef(new Vector3());
  const pressed = useRef({});

  const basis = useMemo(
    () => ({
      forward: new Vector3(),
      right: new Vector3(),
      worldUp: new Vector3(0, 1, 0),
      movement: new Vector3(),
    }),
    []
  );

  useEffect(() => {
    // Handle pointer lock errors gracefully
    const handlePointerLockError = () => {
      // Silently handle pointer lock errors to prevent console spam
      // This happens when the element is removed from DOM during scene switches
    };

    document.addEventListener("pointerlockerror", handlePointerLockError);

    return () => {
      document.removeEventListener("pointerlockerror", handlePointerLockError);
      // Exit pointer lock on unmount if active
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock().catch(() => {
          // Ignore errors when exiting
        });
      }
    };
  }, [gl.domElement]);

  useEffect(() => {
    const onKey = (value) => (event) => {
      pressed.current[event.code] = value;
    };

    const keyDown = onKey(true);
    const keyUp = onKey(false);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, []);

  useFrame((_, delta) => {
    const { forward, right, worldUp, movement } = basis;

    forward.set(0, 0, -1).applyQuaternion(camera.quaternion).setY(0).normalize();
    right.crossVectors(forward, worldUp).normalize();

    movement.set(0, 0, 0);

    if (KEY_MAP.forward.some((code) => pressed.current[code])) movement.add(forward);
    if (KEY_MAP.backward.some((code) => pressed.current[code])) movement.sub(forward);
    if (KEY_MAP.left.some((code) => pressed.current[code])) movement.sub(right);
    if (KEY_MAP.right.some((code) => pressed.current[code])) movement.add(right);
    if (KEY_MAP.up.some((code) => pressed.current[code])) movement.y += 1;
    if (KEY_MAP.down.some((code) => pressed.current[code])) movement.y -= 1;

    if (movement.lengthSq() > 0) {
      movement.normalize();
      const glideBoost = KEY_MAP.glide.some((code) => pressed.current[code]) ? 1.35 : 1;
      velocity.current.addScaledVector(movement, speed * glideBoost * delta);
    }

    velocity.current.multiplyScalar(floatDrag);
    camera.position.addScaledVector(velocity.current, delta * 60);

    camera.position.x = Math.max(-bounds, Math.min(bounds, camera.position.x));
    camera.position.y = Math.max(1.5, Math.min(45, camera.position.y));
    camera.position.z = Math.max(-bounds, Math.min(bounds, camera.position.z));
  });

  return <PointerLockControls />;
}
