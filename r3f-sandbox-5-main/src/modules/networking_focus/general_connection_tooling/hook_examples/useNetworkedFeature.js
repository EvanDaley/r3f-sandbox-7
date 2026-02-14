// This is a pseudocode example of a hook that sends and receives its own payloads.
// It has a switch statement for the types of messages it processes.
// On scene initialization, it connects itself to the message bus.
// This doesn't do anything - it's intended as pseudocode to describe the pattern.
// I have a simpler version here: useNewNetworkedFeature
// And a real use case here: useNetworkedPlayer

// useNetworkedFeature.js
import { useEffect } from "react";
import { messageBus } from "messageBus";
import { usePeerStore } from "stores/peerStore";
import { useFeatureStore } from "stores/useFeatureStore";
import { broadcastMessage } from "broadcastMessage";

export function useNetworkedFeature(group = "featureGroup") {
  const isHost = usePeerStore((s) => s.isHost);
  const peerId = usePeerStore((s) => s.peerId);
  const updateLocalState = useFeatureStore((s) => s.updateLocalState);
  const getAllState = useFeatureStore.getState;

  useEffect(() => {
    if (!peerId) return;

    // --- Subscribe to incoming messages ---
    const unsubscribe = messageBus.subscribe(group, ({ fromPeerId, type, payload }) => {
      const senderId = payload?.sender || fromPeerId;

      switch (type) {
        // --- Client → Host: new data event ---
        case "updateData": {
          const { data } = payload;
          if (!senderId || !data) return;

          // Host rebroadcasts to other peers
          if (isHost) {
            broadcastMessage(
              {
                scene: "bus",
                type: "rebroadcastData",
                payload: { group, sender: senderId, data },
              },
              { hostOnly: true }
            );
          }

          // Apply locally
          updateLocalState(senderId, data);
          break;
        }

        // --- Host → Clients: rebroadcasted data ---
        case "rebroadcastData": {
          const { data } = payload;
          if (!senderId || !data) return;
          updateLocalState(senderId, data);
          break;
        }

        // --- Client → Host: requests global state ---
        case "requestFullState": {
          if (isHost) {
            const allData = getAllState().data;
            broadcastMessage(
              {
                scene: "bus",
                type: "fullStateResponse",
                payload: { group, sender: peerId, data: allData },
              },
              { hostOnly: true }
            );
          }
          break;
        }

        // --- Host → Client: sends current full state ---
        case "fullStateResponse": {
          const { data } = payload;
          if (!data) return;
          Object.entries(data).forEach(([id, value]) => updateLocalState(id, value));
          break;
        }

        default:
          break;
      }
    });

    // --- Clients: request state on join ---
    if (!isHost) {
      setTimeout(() => {
        messageBus.broadcast(group, "requestFullState", { sender: peerId });
      }, 200);
    }

    return unsubscribe;
  }, [peerId, isHost, group, updateLocalState]);

  // --- Public API for this feature ---
  const broadcastUpdate = (data) => {
    if (!peerId) return;
    updateLocalState(peerId, data);
    messageBus.broadcast(group, "updateData", { sender: peerId, data });
  };

  return { broadcastUpdate };
}
