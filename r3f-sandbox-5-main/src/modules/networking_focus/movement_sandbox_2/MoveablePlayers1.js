import {useInitPlayer} from "./hooks/useInitPlayer";
import {usePaletteStore} from "../../dynamic_colors/stores/paletteStore";
import {usePlayerStore} from "./stores/usePlayerStore";
import {usePeerStore} from "../general_connection_tooling/stores/peerStore";
import React, {useRef, useEffect} from "react";
import {useFrame} from "@react-three/fiber";
import {useRobotMovement} from "./hooks/useRobotMovement";
import LittleRobot from "../../dynamic_colors/objects/LittleRobot";
import Ninja1 from "../../dynamic_colors/objects/Ninja1";
import * as THREE from "three";

// Interpolation factor for remote players
const REMOTE_INTERPOLATION_FACTOR = 0.2;

/**
 * Component for a remote (non-local) player that interpolates position/rotation
 * from store data for smooth movement.
 */
function RemotePlayer({ playerId, transform, materials, scale }) {
  const meshRef = useRef();
  const targetPosition = useRef(
    new THREE.Vector3(transform?.x ?? 0, transform?.y ?? 0, transform?.z ?? 0)
  );
  const targetRotation = useRef(transform?.rotation ?? 0);

  // Update target when transform changes
  useEffect(() => {
    if (transform) {
      targetPosition.current.set(transform.x, transform.y, transform.z);
      targetRotation.current = transform.rotation ?? 0;
    }
  }, [transform]);

  // Interpolate to target position/rotation
  useFrame(() => {
    if (!meshRef.current) return;

    // Interpolate position
    meshRef.current.position.lerp(targetPosition.current, REMOTE_INTERPOLATION_FACTOR);

    // Interpolate rotation
    const currentRot = meshRef.current.rotation.y;
    const targetRot = targetRotation.current;
    
    // Handle rotation wrapping (shortest path)
    let rotDiff = targetRot - currentRot;
    if (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
    if (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
    
    meshRef.current.rotation.y = currentRot + rotDiff * REMOTE_INTERPOLATION_FACTOR;
  });

  return (
    <Ninja1
      ref={meshRef}
      materials={materials}
      scale={scale}
      position={[transform.x, transform.y, transform.z]}
      rotation={[0, transform.rotation ?? 0, 0]}
    />
  );
}

export default function MoveablePlayers1({ onLocalPlayerRef }) {
  useInitPlayer();

  const activePalette = usePaletteStore((s) => s.activePalette);
  const palettes = usePaletteStore((s) => s.palettes);
  const players = usePlayerStore((s) => s.players);
  const {
    peerId,
    hostId
  } = usePeerStore((s) => ({
    peerId: s.peerId,
    hostId: s.hostId,
  }));

  const localRef = useRef();
  useRobotMovement(localRef);

  // Expose local player ref to parent component (for camera following)
  useEffect(() => {
    if (onLocalPlayerRef) {
      onLocalPlayerRef(localRef);
    }
  }, [onLocalPlayerRef]);

  return (
    <>
      {Object.entries(players).map(([id, transform]) => {
        const isHostPlayer = id === hostId;
        const isSelf = id === peerId;
        const scale = isHostPlayer ? 1 : 1;
        const materials = activePalette;
        const rotationY = transform.rotation ?? 0;

        if (isSelf) {
          // Local player - controlled directly by useRobotMovement, position/rotation managed by ref
          return (
            <Ninja1
              key={id}
              ref={localRef}
              materials={materials}
              scale={scale}
              position={[transform.x, transform.y, transform.z]}
              rotation={[0, rotationY, 0]}
            />
          );
        }

        // Remote players - interpolated from store data
        return (
          <RemotePlayer
            key={id}
            playerId={id}
            transform={transform}
            materials={materials}
            scale={scale}
          />
        );
      })}
    </>
  )
}