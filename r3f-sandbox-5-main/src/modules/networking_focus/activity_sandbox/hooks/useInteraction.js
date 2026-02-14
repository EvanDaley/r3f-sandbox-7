// hooks/useInteraction.js
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";
import { useSharedObjectsStore } from "../stores/useSharedObjectsStore";
import { usePlayerStoreV2 } from "../stores/usePlayerStoreV2";
import { useSharedObjectsNetwork } from "./useSharedObjectsNetwork";

const INTERACTION_DISTANCE = 3; // Distance to interact with objects
const MAX_CARRY_DISTANCE = 4; // Max distance between players before auto-drop
const INTERACTION_KEY = "e";

export function useInteraction(playerRef) {
  const peerId = usePeerStore((s) => s.peerId);
  const objects = useSharedObjectsStore((s) => s.objects);
  const players = usePlayerStoreV2((s) => s.players);
  const { broadcastGrab, broadcastRelease } = useSharedObjectsNetwork();
  const keys = useRef({});
  const lastInteractionTime = useRef(0);
  const lastAutoReleaseCheck = useRef(0);

  useEffect(() => {
    const down = (e) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    const up = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame(() => {
    if (!playerRef?.current || !peerId) return;

    const playerPos = playerRef.current.position;
    const now = performance.now();

    // Check for auto-release when players move too far apart (every 200ms)
    if (now - lastAutoReleaseCheck.current >= 200) {
      Object.entries(objects).forEach(([objectId, object]) => {
        if (!object.position || object.type !== 'box') return;

        const objectPos = new THREE.Vector3(
          object.position.x,
          object.position.y || 0,
          object.position.z
        );

        // Check for single player walking away
        if (object.heldBy?.length === 1) {
          const holderId = object.heldBy[0];
          const holder = players[holderId];

          if (holder) {
            const holderPos = new THREE.Vector3(holder.x, holder.y || 0, holder.z);
            const distance = holderPos.distanceTo(objectPos);

            // Auto-release if single player walks too far away
            if (distance > INTERACTION_DISTANCE) {
              broadcastRelease(objectId, holderId);
            }
          }
        }
        // Check for two players moving too far apart
        else if (object.heldBy?.length >= 2) {
          const player1 = players[object.heldBy[0]];
          const player2 = players[object.heldBy[1]];

          if (player1 && player2) {
            const distance = Math.sqrt(
              Math.pow(player1.x - player2.x, 2) +
              Math.pow(player1.z - player2.z, 2)
            );

            // Auto-release if players are too far apart
            if (distance > MAX_CARRY_DISTANCE) {
              // Release both players
              if (object.heldBy[0]) {
                broadcastRelease(objectId, object.heldBy[0]);
              }
              if (object.heldBy[1]) {
                broadcastRelease(objectId, object.heldBy[1]);
              }
            }
          }
        }
      });
      lastAutoReleaseCheck.current = now;
    }

    // Throttle interactions (prevent spam)
    if (now - lastInteractionTime.current < 300) return;

    if (keys.current[INTERACTION_KEY]) {
      // First, check if player is holding any box - if so, allow release
      let isHoldingAnyBox = false;
      let heldBoxId = null;
      Object.entries(objects).forEach(([objectId, object]) => {
        if (object.heldBy?.includes(peerId)) {
          isHoldingAnyBox = true;
          heldBoxId = objectId;
        }
      });

      // If player is holding a box, allow release from any distance
      if (isHoldingAnyBox && heldBoxId) {
        broadcastRelease(heldBoxId, peerId);
        lastInteractionTime.current = now;
        return;
      }

      // If player is already holding a box, don't allow grabbing another
      if (isHoldingAnyBox) {
        lastInteractionTime.current = now;
        return;
      }

      // Otherwise, check if nearby to grab (player is not holding anything)
      Object.entries(objects).forEach(([objectId, object]) => {
        // Check if nearby to grab
        if (!object.position) return;

        const objectPos = new THREE.Vector3(
          object.position.x,
          object.position.y || 0,
          object.position.z
        );

        const distance = playerPos.distanceTo(objectPos);

        if (distance <= INTERACTION_DISTANCE) {
          // Try to grab (only if not at capacity and player isn't already holding something)
          const maxHolders = object.type === 'box' ? 2 : 1;
          if (!object.heldBy || object.heldBy.length < maxHolders) {
            broadcastGrab(objectId, peerId);
            lastInteractionTime.current = now;
          }
        }
      });
    }
  });
}

