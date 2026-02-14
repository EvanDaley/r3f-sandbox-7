import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useSharedObjectsStore } from "../stores/useSharedObjectsStore";
import { useSharedObjectsNetwork } from "../hooks/useSharedObjectsNetwork";
import { usePlayerStoreV4 } from "../stores/usePlayerStoreV4";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";
import { useBombTimer } from "../hooks/useBombTimer";
import Explosion from "./Explosion";
import BombConnection from "./BombConnection";
import * as THREE from "three";

const INTERPOLATION_FACTOR = 0.2;
const BOMB_HEIGHT = 0.8;
const CARRY_HEIGHT = 1.5; // Height above ground when carried
const BROADCAST_THROTTLE_MS = 100;
const INITIAL_TIMER = 6; // Seconds
const TIMER_HEIGHT_OFFSET = 1.2; // Height above bomb for timer display

export default function Bomb({ bombId, initialPosition, materials }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const targetPosition = useRef(new THREE.Vector3());
  const players = usePlayerStoreV4((s) => s.players);
  const peerId = usePeerStore((s) => s.peerId);
  const { broadcastObjectPosition } = useSharedObjectsNetwork();
  const lastBroadcastTime = useRef(0);
  
  // Subscribe to object state changes (for reactive updates)
  const object = useSharedObjectsStore((s) => s.objects[bombId]);
  
  // Check if bomb is being carried
  const isCarried = object?.heldBy && object.heldBy.length >= 2;
  
  // Use timer hook for all timer logic
  const { timerValue, showTimer, exploded } = useBombTimer(bombId, isCarried);

  // Initialize object in store if not present
  useEffect(() => {
    const currentObject = useSharedObjectsStore.getState().objects[bombId];
    if (!currentObject) {
      useSharedObjectsStore.getState().setObject(bombId, {
        position: initialPosition,
        heldBy: [],
        type: 'bomb',
        timer: null, // Timer starts when picked up
      });
    }
  }, [bombId, initialPosition]);

  // Calculate target position based on holders or network updates
  useFrame((_, delta) => {
    if (!meshRef.current || !object) return;

    // Check if local player is holding this bomb
    const isLocalPlayerHolding = object.heldBy?.includes(peerId);

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
          useSharedObjectsStore.getState().setObjectPosition(bombId, {
            x: avgX,
            y: CARRY_HEIGHT,
            z: avgZ,
          });

          // Broadcast position updates (throttled)
          const now = performance.now();
          if (now - lastBroadcastTime.current >= BROADCAST_THROTTLE_MS) {
            const currentPos = meshRef.current.position;
            broadcastObjectPosition(bombId, {
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
      // Not being carried - return to ground level
      targetPosition.current.set(
        object.position.x,
        BOMB_HEIGHT / 2, // Ground level (half the bomb height)
        object.position.z
      );
      
      // Update store to reflect ground position when dropped
      if (object.position.y !== BOMB_HEIGHT / 2) {
        useSharedObjectsStore.getState().setObjectPosition(bombId, {
          x: object.position.x,
          y: BOMB_HEIGHT / 2,
          z: object.position.z,
        });
      }
    }

    // Smooth interpolation to target position (works for both local calc and network updates)
    meshRef.current.position.lerp(targetPosition.current, INTERPOLATION_FACTOR);

    // Update material emissive color based on holding state
    if (materialRef.current) {
      const holderCount = object?.heldBy?.length || 0;
      
      if (holderCount >= 2) {
        // Two players holding - full glow (red/orange for bomb)
        materialRef.current.emissive.set("#ff4400");
        materialRef.current.emissiveIntensity = 0.4;
      } else if (holderCount === 1) {
        // One player holding - partial glow (yellow to indicate waiting)
        materialRef.current.emissive.set("#ffaa00");
        materialRef.current.emissiveIntensity = 0.25;
      } else {
        // No one holding - subtle glow (dark red)
        materialRef.current.emissive.set("#440000");
        materialRef.current.emissiveIntensity = 0.1;
      }
    }
  });

  // Get holder count for rendering (reactive)
  const holderCount = object?.heldBy?.length || 0;
  
  // Format timer as "M:SS" (e.g., "0:22")
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const timerText = showTimer ? formatTimer(timerValue) : "";

  // Track bomb position for explosion and connections
  const bombPositionRef = useRef({ x: initialPosition.x, y: BOMB_HEIGHT / 2, z: initialPosition.z });
  const explosionPositionRef = useRef({ x: initialPosition.x, y: BOMB_HEIGHT / 2, z: initialPosition.z });
  
  useFrame(() => {
    if (meshRef.current) {
      const pos = meshRef.current.position;
      bombPositionRef.current = { x: pos.x, y: pos.y, z: pos.z };
      explosionPositionRef.current = { x: pos.x, y: pos.y, z: pos.z };
    } else if (object?.position) {
      bombPositionRef.current = {
        x: object.position.x,
        y: object.position.y || BOMB_HEIGHT / 2,
        z: object.position.z,
      };
    }
  });

  // Don't render bomb if exploded
  if (exploded) {
    return <Explosion position={explosionPositionRef.current} />;
  }

  return (
    <group>
      <mesh ref={meshRef} receiveShadow castShadow position={[initialPosition.x, initialPosition.y || BOMB_HEIGHT / 2, initialPosition.z]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          ref={materialRef}
          color={materials?.s?.color || "#333333"}
          emissive={holderCount >= 2 ? "#ff4400" : holderCount === 1 ? "#ffaa00" : "#440000"}
          emissiveIntensity={holderCount >= 2 ? 0.4 : holderCount === 1 ? 0.25 : 0.1}
        />
      </mesh>
      
      {/* Connection lines to players holding the bomb */}
      {object?.heldBy && object.heldBy.length > 0 && (
        <>
          {object.heldBy.map((playerId) => {
            const player = players[playerId];
            if (!player) return null;
            
            return (
              <BombConnection
                key={`connection-${bombId}-${playerId}`}
                from={{ x: player.x, y: player.y, z: player.z }}
                to={bombPositionRef.current}
                color={holderCount >= 2 ? "#ff4400" : "#ffaa00"}
              />
            );
          })}
        </>
      )}
      
      {/* 3D Countdown Timer - positioned above bomb */}
      {showTimer && (
        <TimerText
          meshRef={meshRef}
          text={timerText}
          timerValue={timerValue}
        />
      )}
    </group>
  );
}

// Separate component for timer text that follows the bomb position
function TimerText({ meshRef, text, timerValue }) {
  const textRef = useRef();
  const position = useRef(new THREE.Vector3());
  const flashTime = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef?.current || !textRef.current) return;
    
    // Update position to be above the bomb
    position.current.set(
      meshRef.current.position.x,
      meshRef.current.position.y + TIMER_HEIGHT_OFFSET,
      meshRef.current.position.z
    );
    
    // Update text position directly
    textRef.current.position.copy(position.current);

    // Ensure material is transparent for opacity changes
    const material = textRef.current?.material;
    if (!material) return;

    material.transparent = true;

    // Flash animation - always flashing, faster as timer gets lower
    if (timerValue !== null && timerValue > 0) {
      flashTime.current += delta;
      
      // Base flash speed increases as timer decreases
      // At 22 seconds: speed = 8, at 0 seconds: speed = 30
      const baseSpeed = 8;
      const maxSpeed = 30;
      const timerProgress = 1 - (timerValue / INITIAL_TIMER); // 0 to 1 as timer counts down
      const flashSpeed = baseSpeed + (maxSpeed - baseSpeed) * timerProgress;
      
      // Dramatic opacity flash: from 0.1 (almost invisible) to 1.0 (fully visible)
      const opacity = 0.1 + (Math.sin(flashTime.current * flashSpeed) * 0.5 + 0.5) * 0.9;
      material.opacity = opacity;
      
      // Dramatic color flash: from bright red to almost white
      if (material.color) {
        const colorIntensity = Math.sin(flashTime.current * flashSpeed) * 0.5 + 0.5; // 0 to 1
        // At 0: bright red (1, 0.27, 0), at 1: almost white (1, 0.9, 0.5)
        material.color.setRGB(
          1,
          0.27 + colorIntensity * 0.63,
          colorIntensity * 0.5
        );
      }
      
      // Add scale pulse for extra drama
      const scale = 1.0 + Math.sin(flashTime.current * flashSpeed) * 0.15;
      textRef.current.scale.set(scale, scale, scale);
    } else {
      // Reset to normal when timer is done
      material.opacity = 1;
      if (material.color) {
        material.color.setRGB(1, 0.27, 0); // #ff4400
      }
      textRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <Text
      ref={textRef}
      fontSize={1.5}
      color="#ff4400"
      anchorX="center"
      anchorY="middle"
      outlineWidth={0.1}
      outlineColor="#000000"
      letterSpacing={0.15}
    >
      {text}
    </Text>
  );
}

