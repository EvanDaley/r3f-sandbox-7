// hooks/useInitPlayerV3.js
import { useEffect, useRef } from "react";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";
import { usePlayerStoreV3 } from "../stores/usePlayerStoreV3";
import { messageBus } from "../../general_connection_tooling/messageBus";

/**
 * Initializes the local player's transform (spawn point and rotation).
 * Runs exactly once per peer when their peerId becomes available.
 * Uses separate group name "gravityPlayerMovement" to avoid conflicts.
 */
export function useInitPlayerV3(group = "gravityPlayerMovement", areaSize = 5) {
  const peerId = usePeerStore((s) => s.peerId);
  const setPlayerTransform = usePlayerStoreV3((s) => s.setPlayerTransform);
  const players = usePlayerStoreV3((s) => s.players);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!peerId || hasInitialized.current) return;

    // Don't respawn if player already exists in store
    if (players[peerId]) {
      hasInitialized.current = true;
      return;
    }

    // Create a spawn transform (spawn on ground level)
    const spawn = {
      x: (Math.random() - 0.5) * areaSize,
      y: 0.01, // Spawn on top of tiles
      z: (Math.random() - 0.5) * areaSize,
      rotation: 0,
    };

    // Store locally
    setPlayerTransform(peerId, spawn);

    // Broadcast to others (so we appear immediately)
    messageBus.broadcast(group, "updateTransform", {
      sender: peerId,
      transform: spawn,
    });

    hasInitialized.current = true;
    console.log(`[Gravity Sandbox] Initialized local player ${peerId} at`, spawn);
  }, [peerId, players, setPlayerTransform, group, areaSize]);
}

