// hooks/useInitPlayer.js
import { useEffect, useRef } from "react";
import {usePeerStore} from "../../general_connection_tooling/stores/peerStore";
import {usePlayerStore} from "../stores/usePlayerStore";
import {messageBus} from "../../general_connection_tooling/messageBus";

/**
 * Initializes the local player's transform (spawn point and rotation).
 * Runs exactly once per peer when their peerId becomes available.
 * Broadcasts the initial transform so others can see this player immediately.
 */
export function useInitPlayer(group = "playerMovement", areaSize = 5) {
  const peerId = usePeerStore((s) => s.peerId);
  const setPlayerTransform = usePlayerStore((s) => s.setPlayerTransform);
  const players = usePlayerStore((s) => s.players);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!peerId || hasInitialized.current) return;

    // Don’t respawn if player already exists in store
    if (players[peerId]) {
      hasInitialized.current = true;
      return;
    }

    // Create a spawn transform
    const spawn = {
      x: (Math.random() - 0.5) * areaSize,
      y: 0,
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
    console.log(`Initialized local player ${peerId} at`, spawn);
  }, [peerId, players, setPlayerTransform, group, areaSize]);
}
