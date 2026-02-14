import { useInitPlayerV2 } from "./hooks/useInitPlayerV2";
import { usePaletteStore } from "../../dynamic_colors/stores/paletteStore";
import { usePlayerStoreV2 } from "./stores/usePlayerStoreV2";
import { usePeerStore } from "../general_connection_tooling/stores/peerStore";
import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useRobotMovementV2 } from "./hooks/useRobotMovementV2";
import Ninja1 from "../../dynamic_colors/objects/Ninja1";
import * as THREE from "three";

const REMOTE_INTERPOLATION_FACTOR = 0.2;

function RemotePlayer({ playerId, transform, materials, scale }) {
  const meshRef = useRef();
  const targetPosition = useRef(
    new THREE.Vector3(transform?.x ?? 0, transform?.y ?? 0, transform?.z ?? 0)
  );
  const targetRotation = useRef(transform?.rotation ?? 0);

  useEffect(() => {
    if (transform) {
      targetPosition.current.set(transform.x, transform.y, transform.z);
      targetRotation.current = transform.rotation ?? 0;
    }
  }, [transform]);

  useFrame(() => {
    if (!meshRef.current) return;

    meshRef.current.position.lerp(targetPosition.current, REMOTE_INTERPOLATION_FACTOR);

    const currentRot = meshRef.current.rotation.y;
    const targetRot = targetRotation.current;
    
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

export default function MoveablePlayersV2({ onLocalPlayerRef }) {
  useInitPlayerV2();

  const activePalette = usePaletteStore((s) => s.activePalette);
  const players = usePlayerStoreV2((s) => s.players);
  const { peerId, hostId } = usePeerStore((s) => ({
    peerId: s.peerId,
    hostId: s.hostId,
  }));

  const localRef = useRef();
  useRobotMovementV2(localRef);

  useEffect(() => {
    if (onLocalPlayerRef) {
      onLocalPlayerRef(localRef);
    }
  }, [onLocalPlayerRef]);

  return (
    <>
      {Object.entries(players).map(([id, transform]) => {
        const isSelf = id === peerId;
        const materials = activePalette;
        const rotationY = transform.rotation ?? 0;

        if (isSelf) {
          return (
            <Ninja1
              key={id}
              ref={localRef}
              materials={materials}
              scale={1}
              position={[transform.x, transform.y, transform.z]}
              rotation={[0, rotationY, 0]}
            />
          );
        }

        return (
          <RemotePlayer
            key={id}
            playerId={id}
            transform={transform}
            materials={materials}
            scale={1}
          />
        );
      })}
    </>
  );
}

