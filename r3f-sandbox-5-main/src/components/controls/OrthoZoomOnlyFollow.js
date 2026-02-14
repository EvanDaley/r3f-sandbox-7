import { OrbitControls, OrthographicCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

// Constants for camera follow
const CAMERA_OFFSET = new THREE.Vector3(15, 15, 15); // Isometric offset from player
const FOLLOW_SMOOTHNESS = 0.2; // Lerp factor for smooth following (higher = snappier)

// Fixed isometric camera rotation - calculated from position [15, 15, 15] looking at [0, 0, 0]
// This gives us the standard isometric viewing angle
const ISOMETRIC_ROTATION = (() => {
  const tempCam = new THREE.OrthographicCamera();
  tempCam.position.set(15, 15, 15);
  tempCam.lookAt(0, 0, 0);
  return tempCam.rotation.clone();
})();

/**
 * Orthographic camera that follows a target object ref with smooth interpolation.
 * Maintains fixed isometric angle (no rotation changes) and allows zoom controls only.
 * 
 * @param {Object} targetRef - React ref to a THREE.Object3D (mesh/group) to follow
 */
export default function OrthoZoomOnlyFollow({ targetRef = null }) {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const rotationInitialized = useRef(false);
  
  // Desired camera position (target + offset)
  const desiredPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3(CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z));
  const targetVec = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!cameraRef.current) return;

    // Initialize and lock camera rotation to isometric angle (only once)
    if (!rotationInitialized.current) {
      cameraRef.current.rotation.copy(ISOMETRIC_ROTATION);
      rotationInitialized.current = true;
    }

    // Always enforce fixed rotation (prevent any rotation changes)
    cameraRef.current.rotation.copy(ISOMETRIC_ROTATION);

    // Get position directly from mesh ref if available (real-time, smooth)
    if (targetRef?.current) {
      targetVec.current.copy(targetRef.current.position);
    } else {
      // If no target, maintain default position
      desiredPosition.current.set(CAMERA_OFFSET.x, CAMERA_OFFSET.y, CAMERA_OFFSET.z);
      currentPosition.current.lerp(desiredPosition.current, FOLLOW_SMOOTHNESS);
      cameraRef.current.position.copy(currentPosition.current);
      return;
    }

    // Calculate desired position based on target
    desiredPosition.current.set(
      targetVec.current.x + CAMERA_OFFSET.x,
      targetVec.current.y + CAMERA_OFFSET.y,
      targetVec.current.z + CAMERA_OFFSET.z
    );

    // Smoothly interpolate camera position (position only, no rotation)
    currentPosition.current.lerp(desiredPosition.current, FOLLOW_SMOOTHNESS);
    
    // Update camera position only (rotation stays fixed)
    cameraRef.current.position.copy(currentPosition.current);
    
    // Update controls target (for look-at calculations) but don't let it affect rotation
    if (controlsRef.current) {
      controlsRef.current.target.copy(targetVec.current);
      // Ensure controls don't change rotation
      controlsRef.current.update();
    }
  });

  return (
    <>
      <OrthographicCamera 
        ref={cameraRef}
        makeDefault 
        position={[15, 15, 15]} 
        zoom={50} 
      />

      {/* <OrbitControls
        ref={controlsRef}
        enableRotate={false}
        enableZoom={true}
        zoomSpeed={1.0}
        minZoom={20}
        maxZoom={100}
        target={[0, 0, 0]} // Will be updated in useFrame
        mouseButtons={{
          LEFT: null,
          MIDDLE: null,
          RIGHT: THREE.MOUSE.PAN,
          WHEEL: THREE.MOUSE.DOLLY,
        }}
      /> */}
    </>
  );
}

