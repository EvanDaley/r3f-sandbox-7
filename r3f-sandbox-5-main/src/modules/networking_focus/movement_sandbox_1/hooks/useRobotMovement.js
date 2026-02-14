import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function useRobotMovement(ref, speed = 7) {
  const keys = useRef({});
  const isReady = useRef(false);
  const lastDir = useRef(new THREE.Vector3(0, 0, 1)); // remember last direction

  useEffect(() => {
    const down = (e) => (keys.current[e.key.toLowerCase()] = true);
    const up = (e) => (keys.current[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    if (!ref) return;
    const check = setInterval(() => {
      if (ref.current) {
        isReady.current = true;
        clearInterval(check);
      }
    }, 100);
    return () => clearInterval(check);
  }, [ref]);

  useFrame((_, delta) => {
    if (!isReady.current || !ref.current) return;

    const move = new THREE.Vector3();
    const camRot = Math.PI / 4; // 45° isometric camera

    // Gather input
    if (keys.current["w"]) move.z -= 1;
    if (keys.current["s"]) move.z += 1;
    if (keys.current["a"]) move.x -= 1;
    if (keys.current["d"]) move.x += 1;

    if (move.lengthSq() > 0) {
      move.normalize();
      move.applyAxisAngle(new THREE.Vector3(0, 1, 0), camRot);

      // Save direction for facing
      lastDir.current.copy(move);

      // Move character
      ref.current.position.addScaledVector(move, speed * delta);

      // Rotate to face movement
      const angle = Math.atan2(move.x, move.z);
      ref.current.rotation.y = angle;
    }
  });

  // keep last direction when no keys pressed (so it keeps facing last move)
  useFrame(() => {
    if (!isReady.current || !ref.current) return;
    const move = new THREE.Vector3();
    if (
      keys.current["w"] ||
      keys.current["a"] ||
      keys.current["s"] ||
      keys.current["d"]
    )
      return;
    // Smoothly maintain orientation (optional)
    const angle = Math.atan2(lastDir.current.x, lastDir.current.z);
    ref.current.rotation.y = angle;
  });
}
