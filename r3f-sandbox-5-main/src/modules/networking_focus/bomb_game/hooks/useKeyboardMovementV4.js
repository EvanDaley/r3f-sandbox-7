import { useEffect, useRef } from "react";
import * as THREE from "three";

export function useKeyboardMovementV4(speed = 7) {
  const keys = useRef({});
  const direction = useRef(new THREE.Vector3(0, 0, 1));

  useEffect(() => {
    const down = (e) => (keys.current[e.key.toLowerCase()] = true);
    const up = (e) => (keys.current[e.key.toLowerCase()] = false);

    const clearKeys = () => {
      for (const k in keys.current) keys.current[k] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clearKeys);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearKeys();
    });

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clearKeys);
      document.removeEventListener("visibilitychange", clearKeys);
    };
  }, []);

  const computeMovement = (delta) => {
    const move = new THREE.Vector3();
    if (keys.current["w"]) move.z -= 1;
    if (keys.current["s"]) move.z += 1;
    if (keys.current["a"]) move.x -= 1;
    if (keys.current["d"]) move.x += 1;

    if (move.lengthSq() > 0) {
      move.normalize();
      move.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4); // isometric
      direction.current.copy(move);
      return move.multiplyScalar(speed * delta);
    }

    return new THREE.Vector3(0, 0, 0);
  };

  return { keys, direction, computeMovement };
}

