// hooks/useNetworkedPlayerV3.js
import { useEffect } from "react";
import { messageBus } from "../../general_connection_tooling/messageBus";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";
import { usePlayerStoreV3 } from "../stores/usePlayerStoreV3";
import { broadcastMessage } from "../../general_connection_tooling/broadcastMessage";

export function useNetworkedPlayerV3(group = "gravityPlayerMovement") {
  const isHost = usePeerStore((s) => s.isHost);
  const peerId = usePeerStore((s) => s.peerId);
  const setPlayerTransform = usePlayerStoreV3((s) => s.setPlayerTransform);
  const getPlayers = usePlayerStoreV3.getState;

  useEffect(() => {
    if (!peerId) return;

    const unsubscribe = messageBus.subscribe(group, ({ fromPeerId, payload, type }) => {
      const senderId = payload?.sender || fromPeerId;

      switch (type) {
        case "updateTransform": {
          const { transform } = payload;
          if (!senderId || !transform) return;

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

        case "rebroadcastTransform": {
          const { transform } = payload;
          if (!senderId || !transform) return;
          setPlayerTransform(senderId, transform);
          break;
        }

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

        case "playerListResponse": {
          const { players } = payload;
          if (!players) return;

          Object.entries(players).forEach(([id, transform]) => {
            setPlayerTransform(id, transform);
          });

          console.log("✅ [Gravity Sandbox] Synced player list from host:", players);
          break;
        }

        default:
          break;
      }
    });

    if (!isHost) {
      setTimeout(() => {
        messageBus.broadcast(group, "requestPlayerList", { sender: peerId });
        console.log("📡 [Gravity Sandbox] Requested player list from host");
      }, 200);
    }

    return unsubscribe;
  }, [peerId, isHost, group, setPlayerTransform]);

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

