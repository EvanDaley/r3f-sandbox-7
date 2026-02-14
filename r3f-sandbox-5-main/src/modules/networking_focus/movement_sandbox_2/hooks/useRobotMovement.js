// hooks/useRobotMovement.js
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useKeyboardMovement } from "./useKeyboardMovement";
import { useNetworkedPlayer } from "./useNetworkedPlayer";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";

// Constants
const BROADCAST_THROTTLE_MS = 100; // Only broadcast every 100ms (10 updates/sec)
const POSITION_CHANGE_THRESHOLD = 0.01; // Only broadcast if position changed by this much
const ROTATION_CHANGE_THRESHOLD = 0.01; // Only broadcast if rotation changed by this much

/**
 * Hook for controlling the local player movement.
 * - Direct keyboard control with authoritative local movement (no interpolation from store)
 * - Broadcasts are throttled and only sent on meaningful changes
 * - Note: Remote player interpolation is handled in MoveablePlayers1 component
 */
export function useRobotMovement(ref) {
  const { computeMovement, direction } = useKeyboardMovement();
  const { broadcastTransform } = useNetworkedPlayer("playerMovement");
  const peerId = usePeerStore((s) => s.peerId);
  
  // Throttling for broadcasts
  const lastBroadcastTime = useRef(0);
  const lastBroadcastPosition = useRef(new THREE.Vector3());
  const lastBroadcastRotation = useRef(0);
  const isInitialized = useRef(false);

  // Initialize broadcast tracking when ref becomes available
  useEffect(() => {
    if (ref.current && !isInitialized.current) {
      lastBroadcastPosition.current.copy(ref.current.position);
      lastBroadcastRotation.current = ref.current.rotation.y;
      isInitialized.current = true;
    }
  }, [ref]);

  // Local player movement - only for the local player
  useFrame((_, delta) => {
    if (!ref.current || !peerId) return;

    // Initialize on first frame if needed
    if (!isInitialized.current && ref.current) {
      lastBroadcastPosition.current.copy(ref.current.position);
      lastBroadcastRotation.current = ref.current.rotation.y;
      isInitialized.current = true;
    }

    const moveVec = computeMovement(delta);
    let shouldBroadcast = false;

    if (moveVec.lengthSq() > 0) {
      // Apply movement directly (authoritative local control)
      ref.current.position.add(moveVec);

      const angle = Math.atan2(direction.current.x, direction.current.z);
      ref.current.rotation.y = angle;

      // Check if we should broadcast (throttled + threshold check)
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
      // Even when not moving, broadcast periodically to ensure sync (but less frequently)
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

    // Broadcast if needed
    if (shouldBroadcast) {
      broadcastTransform(ref.current.position, ref.current.rotation.y);
    }
  });

  // Note: Remote player interpolation is handled in MoveablePlayers1 component
  // The local player should NEVER interpolate from store data (authoritative control)
}
