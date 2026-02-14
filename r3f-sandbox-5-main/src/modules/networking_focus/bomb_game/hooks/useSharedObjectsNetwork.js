// hooks/useSharedObjectsNetwork.js
import { useEffect } from "react";
import { messageBus } from "../../general_connection_tooling/messageBus";
import { usePeerStore } from "../../general_connection_tooling/stores/peerStore";
import { useSharedObjectsStore } from "../stores/useSharedObjectsStore";
import { broadcastMessage } from "../../general_connection_tooling/broadcastMessage";

const GROUP = "bombGameSharedObjects";
const INITIAL_TIMER = 6; // Seconds

export function useSharedObjectsNetwork() {
  const isHost = usePeerStore((s) => s.isHost);
  const peerId = usePeerStore((s) => s.peerId);
  const setObject = useSharedObjectsStore((s) => s.setObject);
  const setObjectPosition = useSharedObjectsStore((s) => s.setObjectPosition);
  const addHolder = useSharedObjectsStore((s) => s.addHolder);
  const removeHolder = useSharedObjectsStore((s) => s.removeHolder);
  const setTimer = useSharedObjectsStore((s) => s.setTimer);
  const setExploded = useSharedObjectsStore((s) => s.setExploded);
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

        case "startTimer": {
          const { objectId, startTime } = payload;
          if (!objectId || !startTime) return;

          // Set timer start time in store
          // Note: startTime is the host's performance.now() timestamp
          // Clients will use this to sync their local timers
          const object = getObjects().objects[objectId];
          if (object && !object.timerStartTime) {
            setTimer(objectId, INITIAL_TIMER); // Set initial value, startTime is stored separately
            // Store startTime in the object (this is the host's timestamp)
            useSharedObjectsStore.getState().setObject(objectId, {
              ...object,
              timerStartTime: startTime,
            });
          }

          // Host rebroadcasts to ensure consistency
          if (isHost) {
            broadcastMessage(
              {
                scene: "bus",
                type: "rebroadcastStartTimer",
                payload: { group: GROUP, sender: senderId, objectId, startTime },
              },
              { hostOnly: true }
            );
          }
          break;
        }

        case "rebroadcastStartTimer": {
          const { objectId, startTime } = payload;
          if (objectId && startTime) {
            const object = getObjects().objects[objectId];
            if (object && !object.timerStartTime) {
              setTimer(objectId, INITIAL_TIMER);
              useSharedObjectsStore.getState().setObject(objectId, {
                ...object,
                timerStartTime: startTime,
              });
            }
          }
          break;
        }

        case "explodeBomb": {
          const { objectId } = payload;
          if (!objectId) return;

          // Optimistic update - all clients explode immediately
          setExploded(objectId, true);

          // Host rebroadcasts to ensure consistency
          if (isHost) {
            broadcastMessage(
              {
                scene: "bus",
                type: "rebroadcastExplodeBomb",
                payload: { group: GROUP, sender: senderId, objectId },
              },
              { hostOnly: true }
            );
          }
          break;
        }

        case "rebroadcastExplodeBomb": {
          const { objectId } = payload;
          if (objectId) {
            setExploded(objectId, true);
          }
          break;
        }

        default:
          break;
      }
    });

    return unsubscribe;
  }, [peerId, isHost, setObjectPosition, addHolder, removeHolder, setTimer, setExploded, getObjects]);

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

  const broadcastStartTimer = (objectId, startTime) => {
    if (!peerId) return;
    messageBus.broadcast(GROUP, "startTimer", {
      sender: peerId,
      objectId,
      startTime,
    });
  };

  const broadcastExplodeBomb = (objectId) => {
    if (!peerId) return;
    messageBus.broadcast(GROUP, "explodeBomb", {
      sender: peerId,
      objectId,
    });
  };

  return { broadcastObjectPosition, broadcastGrab, broadcastRelease, broadcastStartTimer, broadcastExplodeBomb };
}

