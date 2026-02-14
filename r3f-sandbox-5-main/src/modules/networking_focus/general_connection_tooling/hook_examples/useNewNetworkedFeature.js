// This is a pseudocode example of a hook that sends and receives its own payloads.
// It has a switch statement for the types of messages it processes.
// On scene initialization, it connects itself to the message bus.
// This doesn't do anything - it's intended as pseudocode to describe the pattern.
// For a slightly more comprehensive example, see useNetworkedFeature and useNetworkedPlayer

// useNetworkedFeature.js
export function useNewNetworkedFeature(group) {
  const { isHost, peerId } = usePeerStore();
  const { updateLocal, getAll } = useFeatureStore();

  useEffect(() => {
    // Subscribe to all incoming network messages for this feature group
    subscribeTo(group, (msg) => {
      switch (msg.type) {

        // Client → Host
        // A client is sending new data to the host.
        // Host rebroadcasts it to other clients and applies it locally.
        case "update":
          if (isHost) rebroadcast(msg);
          updateLocal(msg.sender, msg.data);
          break;

        // Host → Clients
        // The host rebroadcasts an update to keep all clients in sync.
        case "rebroadcast":
          updateLocal(msg.sender, msg.data);
          break;

        // Client → Host
        // A client just joined and is requesting the current full state.
        case "requestState":
          if (isHost) sendStateTo(msg.sender, getAll());
          break;

        // Host → Client
        // The host responds with the current state so the new client can catch up.
        case "stateResponse":
          mergeState(msg.data);
          break;
      }
    });

    // Client → Host
    // When a non-host joins, immediately request the latest state from the host.
    if (!isHost) requestStateFromHost();

  }, [peerId, isHost]);

  // Public API
  // Sends a local update and broadcasts it to other peers.
  const sendUpdate = (data) => {
    updateLocal(peerId, data);
    broadcast(group, "update", { sender: peerId, data });
  };

  return { sendUpdate };
}
