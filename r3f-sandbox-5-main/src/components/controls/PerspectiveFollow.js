import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// Constants for camera follow
const CAMERA_OFFSET = new THREE.Vector3(10, 8, 10); // Offset from player
const FOLLOW_SMOOTHNESS = 0.2; // Lerp factor for smooth following

/**
 * Perspective camera that follows a target object ref with smooth interpolation.
 * 
 * @param {Object} targetRef - React ref to a THREE.Object3D (mesh/group) to follow
 */
export default function PerspectiveFollow({ targetRef = null }) {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const desiredPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3(CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z));
  const targetVec = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!cameraRef.current) return;

    if (targetRef?.current) {
      targetVec.current.copy(targetRef.current.position);
    } else {
      // Default position if no target
      desiredPosition.current.set(CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z);
      currentPosition.current.lerp(desiredPosition.current, FOLLOW_SMOOTHNESS);
      cameraRef.current.position.copy(currentPosition.current);
      return;
    }

    // Calculate desired position (target + offset)
    desiredPosition.current.set(
      targetVec.current.x + CAMERA_OFFSET.x,
      targetVec.current.y + CAMERA_OFFSET.y,
      targetVec.current.z + CAMERA_OFFSET.z
    );

    // Smoothly interpolate to desired position
    currentPosition.current.lerp(desiredPosition.current, FOLLOW_SMOOTHNESS);
    cameraRef.current.position.copy(currentPosition.current);

    // Make camera look at the target
    cameraRef.current.lookAt(targetVec.current);

    // Update controls target
    if (controlsRef.current) {
      controlsRef.current.target.copy(targetVec.current);
      controlsRef.current.update();
    }
  });

  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef}
        makeDefault 
        position={[CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z]} 
        fov={75}
      />
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
        target={[0, 0, 0]}
      />
    </>
  );
}

