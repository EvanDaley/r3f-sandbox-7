// hooks/useRobotMovementV3.js
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useKeyboardMovementV3 } from "./useKeyboardMovementV3";
import { useNetworkedPlayerV3 } from "./useNetworkedPlayerV3";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";
import { useGravity } from "./useGravity";

// Constants
const BROADCAST_THROTTLE_MS = 100;
const POSITION_CHANGE_THRESHOLD = 0.01;
const ROTATION_CHANGE_THRESHOLD = 0.01;
const JUMP_VELOCITY = 8; // Initial upward velocity when jumping

/**
 * Hook for controlling the local player movement with gravity.
 * Uses separate group "gravityPlayerMovement" to avoid conflicts.
 */
export function useRobotMovementV3(ref) {
  const { computeMovement, direction, isJumpPressed } = useKeyboardMovementV3();
  const { broadcastTransform } = useNetworkedPlayerV3("gravityPlayerMovement");
  const { getGroundHeight, isOnGround, GRAVITY, GROUND_Y } = useGravity();
  const peerId = usePeerStore((s) => s.peerId);
  
  const lastBroadcastTime = useRef(0);
  const lastBroadcastPosition = useRef(new THREE.Vector3());
  const lastBroadcastRotation = useRef(0);
  const isInitialized = useRef(false);
  const velocity = useRef(new THREE.Vector3(0, 0, 0)); // Velocity for gravity
  const wasOnGround = useRef(false); // Track previous frame's ground state
  const wasJumpPressed = useRef(false); // Track previous frame's jump state

  useEffect(() => {
    if (ref.current && !isInitialized.current) {
      lastBroadcastPosition.current.copy(ref.current.position);
      lastBroadcastRotation.current = ref.current.rotation.y;
      // Start on ground
      const groundY = getGroundHeight(ref.current.position.x, ref.current.position.z);
      if (groundY !== null) {
        ref.current.position.y = groundY;
      }
      isInitialized.current = true;
    }
  }, [ref, getGroundHeight]);

  useFrame((_, delta) => {
    if (!ref.current || !peerId) return;

    if (!isInitialized.current && ref.current) {
      lastBroadcastPosition.current.copy(ref.current.position);
      lastBroadcastRotation.current = ref.current.rotation.y;
      const groundY = getGroundHeight(ref.current.position.x, ref.current.position.z);
      if (groundY !== null) {
        ref.current.position.y = groundY;
      }
      isInitialized.current = true;
    }

    const moveVec = computeMovement(delta);
    let shouldBroadcast = false;

    // Apply horizontal movement
    if (moveVec.lengthSq() > 0) {
      ref.current.position.x += moveVec.x;
      ref.current.position.z += moveVec.z;
      const angle = Math.atan2(direction.current.x, direction.current.z);
      ref.current.rotation.y = angle;
    }

    // Apply gravity and jumping
    const currentX = ref.current.position.x;
    const currentZ = ref.current.position.z;
    const onGround = isOnGround(currentX, currentZ);
    const jumpPressed = isJumpPressed();

    // Handle jumping (only when on ground and space is newly pressed)
    let justJumped = false;
    if (onGround && jumpPressed && !wasJumpPressed.current && velocity.current.y <= 0) {
      // Space was just pressed while on ground - jump!
      velocity.current.y = JUMP_VELOCITY;
      justJumped = true;
    }

    // Apply gravity and movement
    const groundY = getGroundHeight(currentX, currentZ);
    const isJumping = velocity.current.y > 0;
    
    if (onGround && groundY !== null && !isJumping) {
      // On a tile and not jumping - check if we need to land
      if (ref.current.position.y <= groundY + 0.1) {
        // Close to or below ground - snap to ground and stop vertical velocity
        if (velocity.current.y <= 0) {
          ref.current.position.y = groundY;
          velocity.current.y = 0;
        }
      } else {
        // Still above ground - continue falling naturally
        velocity.current.y += GRAVITY * delta;
        ref.current.position.y += velocity.current.y * delta;
      }
    } else {
      // Not on ground or jumping - apply gravity and movement
      // If we just jumped, apply the jump velocity immediately without gravity this frame
      if (justJumped) {
        // Apply jump velocity immediately
        ref.current.position.y += velocity.current.y * delta;
      } else {
        // Normal physics: apply gravity then movement
        velocity.current.y += GRAVITY * delta;
        ref.current.position.y += velocity.current.y * delta;
      }
      
      // Prevent falling through the world (optional safety)
      if (ref.current.position.y < -100) {
        // Respawn at a safe location
        ref.current.position.set(0, GROUND_Y, 0);
        velocity.current.y = 0;
      }
    }

    // Update state for next frame
    wasOnGround.current = onGround;
    wasJumpPressed.current = jumpPressed;

    // Broadcast position updates
    const now = performance.now();
    const timeSinceLastBroadcast = now - lastBroadcastTime.current;
    const positionChanged = ref.current.position.distanceTo(lastBroadcastPosition.current) > POSITION_CHANGE_THRESHOLD;
    const rotationChanged = Math.abs(ref.current.rotation.y - lastBroadcastRotation.current) > ROTATION_CHANGE_THRESHOLD;
    
    if (timeSinceLastBroadcast >= BROADCAST_THROTTLE_MS && (positionChanged || rotationChanged)) {
      shouldBroadcast = true;
      lastBroadcastTime.current = now;
      lastBroadcastPosition.current.copy(ref.current.position);
      lastBroadcastRotation.current = ref.current.rotation.y;
    }

    if (shouldBroadcast) {
      broadcastTransform(ref.current.position, ref.current.rotation.y);
    }
  });
}

