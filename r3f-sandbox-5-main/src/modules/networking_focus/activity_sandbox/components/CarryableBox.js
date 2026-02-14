import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useSharedObjectsStore } from "../stores/useSharedObjectsStore";
import { useSharedObjectsNetwork } from "../hooks/useSharedObjectsNetwork";
import { usePlayerStoreV2 } from "../stores/usePlayerStoreV2";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";
import * as THREE from "three";

const INTERPOLATION_FACTOR = 0.2;
const BOX_HEIGHT = 1;
const CARRY_HEIGHT = 1.5; // Height above ground when carried
const BROADCAST_THROTTLE_MS = 100;

export default function CarryableBox({ boxId, initialPosition, materials }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const targetPosition = useRef(new THREE.Vector3());
  const players = usePlayerStoreV2((s) => s.players);
  const peerId = usePeerStore((s) => s.peerId);
  const { broadcastObjectPosition } = useSharedObjectsNetwork();
  const lastBroadcastTime = useRef(0);
  
  // Subscribe to object state changes (for reactive updates)
  const object = useSharedObjectsStore((s) => s.objects[boxId]);

  // Initialize object in store if not present
  useEffect(() => {
    const currentObject = useSharedObjectsStore.getState().objects[boxId];
    if (!currentObject) {
      useSharedObjectsStore.getState().setObject(boxId, {
        position: initialPosition,
        heldBy: [],
        type: 'box',
      });
    }
  }, [boxId, initialPosition]);

  // Calculate target position based on holders or network updates
  useFrame(() => {
    if (!meshRef.current || !object) return;

    // Check if local player is holding this box
    const isLocalPlayerHolding = object.heldBy?.includes(peerId);
    const isCarried = object.heldBy && object.heldBy.length >= 2;

    // Any client can calculate position if they have both player positions
    if (isCarried && object.heldBy.length >= 2) {
      const player1 = players[object.heldBy[0]];
      const player2 = players[object.heldBy[1]];

      if (player1 && player2) {
        // Calculate position from both players (any client can do this)
        const avgX = (player1.x + player2.x) / 2;
        const avgZ = (player1.z + player2.z) / 2;
        targetPosition.current.set(avgX, CARRY_HEIGHT, avgZ);
        
        // If local player is one of the holders, update store and broadcast
        if (isLocalPlayerHolding) {
          useSharedObjectsStore.getState().setObjectPosition(boxId, {
            x: avgX,
            y: CARRY_HEIGHT,
            z: avgZ,
          });

          // Broadcast position updates (throttled)
          const now = performance.now();
          if (now - lastBroadcastTime.current >= BROADCAST_THROTTLE_MS) {
            const currentPos = meshRef.current.position;
            broadcastObjectPosition(boxId, {
              x: currentPos.x,
              y: currentPos.y,
              z: currentPos.z,
            });
            lastBroadcastTime.current = now;
          }
        }
      } else {
        // Fallback to stored position from network
        targetPosition.current.set(
          object.position.x,
          object.position.y !== undefined ? object.position.y : CARRY_HEIGHT,
          object.position.z
        );
      }
    } else {
      // Not being carried - use stored position
      const storedY = object.position.y !== undefined ? object.position.y : 0;
      targetPosition.current.set(
        object.position.x,
        .5,
        object.position.z
      );
    }

    // Smooth interpolation to target position (works for both local calc and network updates)
    meshRef.current.position.lerp(targetPosition.current, INTERPOLATION_FACTOR);

    // Update material emissive color based on holding state
    if (materialRef.current) {
      const holderCount = object?.heldBy?.length || 0;
      
      if (holderCount >= 2) {
        // Two players holding - full glow (orange)
        materialRef.current.emissive.set("#ffaa00");
        materialRef.current.emissiveIntensity = 0.3;
      } else if (holderCount === 1) {
        // One player holding - partial glow (blue/cyan to indicate waiting)
        materialRef.current.emissive.set("#4a9eff");
        materialRef.current.emissiveIntensity = 0.2;
      } else {
        // No one holding - no glow
        materialRef.current.emissive.set("#000000");
        materialRef.current.emissiveIntensity = 0;
      }
    }
  });

  // Get holder count for rendering (reactive)
  const holderCount = object?.heldBy?.length || 0;
  const isCarried = holderCount >= 2;

  return (
    <mesh ref={meshRef} receiveShadow castShadow position={[initialPosition.x, initialPosition.y || BOX_HEIGHT / 2, initialPosition.z]}>
      <boxGeometry args={[1, BOX_HEIGHT, 1]} />
      <meshStandardMaterial
        ref={materialRef}
        color={materials?.s?.color || "#8b7355"}
        emissive={holderCount >= 2 ? "#ffaa00" : holderCount === 1 ? "#4a9eff" : "#000000"}
        emissiveIntensity={holderCount >= 2 ? 0.3 : holderCount === 1 ? 0.2 : 0}
      />
    </mesh>
  );
}

