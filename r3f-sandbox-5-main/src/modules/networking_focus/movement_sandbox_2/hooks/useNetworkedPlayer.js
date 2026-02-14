// hooks/useNetworkedPlayer.js
import { useEffect } from "react";
import { messageBus } from "../../general_connection_tooling/messageBus";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";
import { usePlayerStore } from "../stores/usePlayerStore";
import { broadcastMessage } from "../../general_connection_tooling/broadcastMessage";

export function useNetworkedPlayer(group = "playerMovement") {
  const isHost = usePeerStore((s) => s.isHost);
  const peerId = usePeerStore((s) => s.peerId);
  const setPlayerTransform = usePlayerStore((s) => s.setPlayerTransform);
  const getPlayers = usePlayerStore.getState;

  useEffect(() => {
    if (!peerId) return;

    const unsubscribe = messageBus.subscribe(group, ({ fromPeerId, payload, type }) => {
      const senderId = payload?.sender || fromPeerId;

      switch (type) {
        // --- CLIENT OR HOST: Receives a transform update ---
        case "updateTransform": {
          const { transform } = payload;
          if (!senderId || !transform) return;

          // Host rebroadcasts as a distinct event (to avoid confusion)
          if (isHost) {
            broadcastMessage(
              {
                scene: "bus",
                type: "rebroadcastTransform",
                payload: { group, sender: senderId, transform },
              },
              { hostOnly: true }
            );
          }

          setPlayerTransform(senderId, transform);
          break;
        }

        // --- CLIENTS: Receive rebroadcasted transform updates from host ---
        case "rebroadcastTransform": {
          const { transform } = payload;
          if (!senderId || !transform) return;
          setPlayerTransform(senderId, transform);
          break;
        }

        // --- CLIENT → HOST: Requests list of players ---
        case "requestPlayerList": {
          if (isHost) {
            const players = getPlayers().players;
            broadcastMessage(
              {
                scene: "bus",
                type: "playerListResponse",
                payload: { group, sender: peerId, players },
              },
              { hostOnly: true }
            );
          }
          break;
        }

        // --- HOST → CLIENT: Sends list of players back ---
        case "playerListResponse": {
          const { players } = payload;
          if (!players) return;

          Object.entries(players).forEach(([id, transform]) => {
            setPlayerTransform(id, transform);
          });

          console.log("✅ Synced player list from host:", players);
          break;
        }

        default:
          break;
      }
    });

    // --- CLIENTS: Request the full list when they join ---
    if (!isHost) {
      setTimeout(() => {
        messageBus.broadcast(group, "requestPlayerList", { sender: peerId });
        console.log("📡 Requested player list from host");
      }, 200);
    }

    return unsubscribe;
  }, [peerId, isHost, group, setPlayerTransform]);

  // --- PLAYER MOVEMENT / ROTATION UPDATES ---
  const broadcastTransform = (position, rotation) => {
    if (!peerId) return;
    const transform = { x: position.x, y: position.y, z: position.z, rotation };
    setPlayerTransform(peerId, transform);
    messageBus.broadcast(group, "updateTransform", {
      sender: peerId,
      transform,
    });
  };

  return { broadcastTransform };
}
