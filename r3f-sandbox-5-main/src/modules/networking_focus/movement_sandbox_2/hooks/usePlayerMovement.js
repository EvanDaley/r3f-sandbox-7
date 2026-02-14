import { useEffect } from "react";
import { usePlayerStore } from "../stores/usePlayerStore";
import { messageBus } from "../../general_connection_tooling/messageBus";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";

export function usePlayerMovement(group = "playerMovement") {
  const isHost = usePeerStore((s) => s.isHost);
  const peerId = usePeerStore((s) => s.peerId);
  const connections = usePeerStore((s) => s.connections);
  const setPlayerPosition = usePlayerStore((s) => s.setPlayerPosition);

  useEffect(() => {
    if (!peerId) return; // don’t run until we know our id

    // --- 0. Assign default starting position (spawn point)
    const initialPosition = {
      x: (Math.random() - 0.5) * 5,
      y: 0,
      z: (Math.random() - 0.5) * 5,
    };
    setPlayerPosition(peerId, initialPosition);

    // Broadcast the spawn position to the host/peers
    messageBus.broadcast(group, "updatePosition", {
      sender: peerId,
      position: initialPosition,
    });

    // --- 1. Subscribe to incoming movement messages
    const unsubscribe = messageBus.subscribe(group, ({ fromPeerId, payload }) => {
      const { position, sender } = payload;
      if (!position) return;

      const senderId = sender || fromPeerId;
      if (!senderId) {
        console.warn("Received updatePosition with no sender ID:", payload);
        return;
      }

      // Host rebroadcasts to everyone except original sender
      if (isHost) {
        Object.values(connections).forEach(({ conn }) => {
          if (conn && conn.open && conn.peer !== senderId) {
            conn.send({
              scene: "bus",
              type: "updatePosition",
              payload: { group, sender: senderId, position },
            });
          }
        });
      }

      // Update local player position
      setPlayerPosition(senderId, position);
    });

    // --- 2. Simulate random movement for this peer
    const moveInterval = setInterval(() => {
      if (!peerId) return; // still no ID, skip

      const position = {
        x: (Math.random() - 0.5) * 5,
        y: 0,
        z: (Math.random() - 0.5) * 5,
      };

      // Update local store immediately
      setPlayerPosition(peerId, position);

      console.log("Sending from", peerId, "position", position);

      // Broadcast to host (who will rebroadcast to others)
      messageBus.broadcast(group, "updatePosition", {
        sender: peerId,
        position,
      });
    }, 3000);

    return () => {
      clearInterval(moveInterval);
      unsubscribe();
    };
  }, [peerId, isHost, group, connections]);
}
