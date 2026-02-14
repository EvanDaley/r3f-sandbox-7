// hooks/useSharedObjectsNetwork.js
import { useEffect } from "react";
import { messageBus } from "../../general_connection_tooling/messageBus";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";
import { useSharedObjectsStore } from "../stores/useSharedObjectsStore";
import { broadcastMessage } from "../../general_connection_tooling/broadcastMessage";

const GROUP = "sharedObjects";

export function useSharedObjectsNetwork() {
  const isHost = usePeerStore((s) => s.isHost);
  const peerId = usePeerStore((s) => s.peerId);
  const setObject = useSharedObjectsStore((s) => s.setObject);
  const setObjectPosition = useSharedObjectsStore((s) => s.setObjectPosition);
  const addHolder = useSharedObjectsStore((s) => s.addHolder);
  const removeHolder = useSharedObjectsStore((s) => s.removeHolder);
  const getObjects = useSharedObjectsStore.getState;

  useEffect(() => {
    if (!peerId) return;

    const unsubscribe = messageBus.subscribe(GROUP, ({ fromPeerId, payload, type }) => {
      const senderId = payload?.sender || fromPeerId;

      switch (type) {
        case "updateObjectPosition": {
          const { objectId, position } = payload;
          if (!objectId || !position) return;

          if (isHost) {
            broadcastMessage(
              {
                scene: "bus",
                type: "rebroadcastObjectPosition",
                payload: { group: GROUP, sender: senderId, objectId, position },
              },
              { hostOnly: true }
            );
          }

          setObjectPosition(objectId, position);
          break;
        }

        case "rebroadcastObjectPosition": {
          const { objectId, position } = payload;
          if (objectId && position) {
            setObjectPosition(objectId, position);
          }
          break;
        }

        case "grabObject": {
          const { objectId, playerId } = payload;
          if (!objectId || !playerId) return;

          // Optimistic update - all clients update immediately
          addHolder(objectId, playerId);

          // Host rebroadcasts to ensure consistency
          if (isHost) {
            broadcastMessage(
              {
                scene: "bus",
                type: "rebroadcastGrabObject",
                payload: { group: GROUP, sender: senderId, objectId, playerId },
              },
              { hostOnly: true }
            );
          }
          break;
        }

        case "rebroadcastGrabObject": {
          const { objectId, playerId } = payload;
          if (objectId && playerId) {
            addHolder(objectId, playerId);
          }
          break;
        }

        case "releaseObject": {
          const { objectId, playerId } = payload;
          if (!objectId || !playerId) return;

          // Optimistic update - all clients update immediately
          removeHolder(objectId, playerId);

          // Host rebroadcasts to ensure consistency
          if (isHost) {
            broadcastMessage(
              {
                scene: "bus",
                type: "rebroadcastReleaseObject",
                payload: { group: GROUP, sender: senderId, objectId, playerId },
              },
              { hostOnly: true }
            );
          }
          break;
        }

        case "rebroadcastReleaseObject": {
          const { objectId, playerId } = payload;
          if (objectId && playerId) {
            removeHolder(objectId, playerId);
          }
          break;
        }

        default:
          break;
      }
    });

    return unsubscribe;
  }, [peerId, isHost, setObjectPosition, addHolder, removeHolder]);

  const broadcastObjectPosition = (objectId, position) => {
    if (!peerId) return;
    messageBus.broadcast(GROUP, "updateObjectPosition", {
      sender: peerId,
      objectId,
      position,
    });
  };

  const broadcastGrab = (objectId, playerId) => {
    if (!peerId) return;
    messageBus.broadcast(GROUP, "grabObject", {
      sender: peerId,
      objectId,
      playerId,
    });
  };

  const broadcastRelease = (objectId, playerId) => {
    if (!peerId) return;
    messageBus.broadcast(GROUP, "releaseObject", {
      sender: peerId,
      objectId,
      playerId,
    });
  };

  return { broadcastObjectPosition, broadcastGrab, broadcastRelease };
}

