// hooks/useRobotMovementV2.js
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useKeyboardMovementV2 } from "./useKeyboardMovementV2";
import { useNetworkedPlayerV2 } from "./useNetworkedPlayerV2";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";

// Constants
const BROADCAST_THROTTLE_MS = 100;
const POSITION_CHANGE_THRESHOLD = 0.01;
const ROTATION_CHANGE_THRESHOLD = 0.01;

/**
 * Hook for controlling the local player movement in activity sandbox.
 * Uses separate group "activityPlayerMovement" to avoid conflicts.
 */
export function useRobotMovementV2(ref) {
  const { computeMovement, direction } = useKeyboardMovementV2();
  const { broadcastTransform } = useNetworkedPlayerV2("activityPlayerMovement");
  const peerId = usePeerStore((s) => s.peerId);
  
  const lastBroadcastTime = useRef(0);
  const lastBroadcastPosition = useRef(new THREE.Vector3());
  const lastBroadcastRotation = useRef(0);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (ref.current && !isInitialized.current) {
      lastBroadcastPosition.current.copy(ref.current.position);
      lastBroadcastRotation.current = ref.current.rotation.y;
      isInitialized.current = true;
    }
  }, [ref]);

  useFrame((_, delta) => {
    if (!ref.current || !peerId) return;

    if (!isInitialized.current && ref.current) {
      lastBroadcastPosition.current.copy(ref.current.position);
      lastBroadcastRotation.current = ref.current.rotation.y;
      isInitialized.current = true;
    }

    const moveVec = computeMovement(delta);
    let shouldBroadcast = false;

    if (moveVec.lengthSq() > 0) {
      ref.current.position.add(moveVec);
      const angle = Math.atan2(direction.current.x, direction.current.z);
      ref.current.rotation.y = angle;

      const now = performance.now();
      const timeSinceLastBroadcast = now - lastBroadcastTime.current;
      
      const positionChanged = ref.current.position.distanceTo(lastBroadcastPosition.current) > POSITION_CHANGE_THRESHOLD;
      const rotationChanged = Math.abs(angle - lastBroadcastRotation.current) > ROTATION_CHANGE_THRESHOLD;
      
      if (timeSinceLastBroadcast >= BROADCAST_THROTTLE_MS && (positionChanged || rotationChanged)) {
        shouldBroadcast = true;
        lastBroadcastTime.current = now;
        lastBroadcastPosition.current.copy(ref.current.position);
        lastBroadcastRotation.current = angle;
      }
    } else {
      const now = performance.now();
      if (now - lastBroadcastTime.current >= BROADCAST_THROTTLE_MS * 3) {
        const positionChanged = ref.current.position.distanceTo(lastBroadcastPosition.current) > POSITION_CHANGE_THRESHOLD;
        const rotationChanged = Math.abs(ref.current.rotation.y - lastBroadcastRotation.current) > ROTATION_CHANGE_THRESHOLD;
        
        if (positionChanged || rotationChanged) {
          shouldBroadcast = true;
          lastBroadcastTime.current = now;
          lastBroadcastPosition.current.copy(ref.current.position);
          lastBroadcastRotation.current = ref.current.rotation.y;
        }
      }
    }

    if (shouldBroadcast) {
      broadcastTransform(ref.current.position, ref.current.rotation.y);
    }
  });
}

