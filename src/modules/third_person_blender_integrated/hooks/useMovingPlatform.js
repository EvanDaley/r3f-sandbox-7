import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Simple hook to animate a platform back and forth
 * @param {Object} options - Configuration options
 * @param {THREE.Vector3} options.startPos - Starting position
 * @param {THREE.Vector3} options.endPos - End position
 * @param {number} options.speed - Movement speed (default: 1)
 * @returns {React.Ref} - Ref to attach to the object
 */
export function useMovingPlatform({ 
  startPos, 
  endPos, 
  speed = 1 
}) {
  const objectRef = useRef();
  const directionRef = useRef(1); // 1 for forward, -1 for backward
  const startVec = useRef(new THREE.Vector3(...startPos));
  const endVec = useRef(new THREE.Vector3(...endPos));

  useFrame((state, delta) => {
    if (!objectRef.current) return;

    const currentPos = objectRef.current.position;
    const direction = directionRef.current;
    
    // Calculate movement
    const moveVec = new THREE.Vector3()
      .subVectors(endVec.current, startVec.current)
      .normalize()
      .multiplyScalar(speed * delta * direction);

    currentPos.add(moveVec);

    // Check if we've reached the end points
    const distanceToStart = currentPos.distanceTo(startVec.current);
    const distanceToEnd = currentPos.distanceTo(endVec.current);
    const totalDistance = startVec.current.distanceTo(endVec.current);

    // Reverse direction when reaching endpoints
    if (direction > 0 && distanceToEnd < 0.1) {
      directionRef.current = -1;
    } else if (direction < 0 && distanceToStart < 0.1) {
      directionRef.current = 1;
    }
  });

  return objectRef;
}
