import { useCallback } from "react";
import { dispatchIncomingNetworkMessage } from "../core/networkEvents";
import { initHostedPeer } from "../initializers/initHostedPeer";
import { initLocalhostPeer } from "../initializers/initLocalhostPeer";
import { useNetworkingStore } from "../stores/useNetworkingStore";

const log = (...args) => {
  console.log("[network/bootstrap]", ...args);
};

const isLocalhostEnvironment = () => {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
};

const setupConnectionLifecycle = (connection, actions) => {
  log("setup connection lifecycle", { peer: connection.peer });

  connection.on("open", () => {
    log("connection open", { peer: connection.peer });
    actions.addConnection(connection);
    actions.setStatus("connected");
  });

  connection.on("data", (data) => {
    log("connection data", { peer: connection.peer, data });
    dispatchIncomingNetworkMessage(data, connection.peer);
  });

  connection.on("close", () => {
    log("connection close", { peer: connection.peer });
    actions.removeConnection(connection.peer);
  });

  connection.on("error", (error) => {
    console.error("[network/bootstrap] connection error", connection.peer, error);
    actions.addError(error);
    actions.setStatus("error");
  });
};

export const useNetworkingBootstrap = () => {
  const peer = useNetworkingStore((state) => state.peer);
  const setPeer = useNetworkingStore((state) => state.setPeer);
  const setIdentity = useNetworkingStore((state) => state.setIdentity);
  const setStatus = useNetworkingStore((state) => state.setStatus);
  const setHostedNameFlowComplete = useNetworkingStore((state) => state.setHostedNameFlowComplete);
  const addConnection = useNetworkingStore((state) => state.addConnection);
  const removeConnection = useNetworkingStore((state) => state.removeConnection);
  const addError = useNetworkingStore((state) => state.addError);

  const onOpen = useCallback(
    ({ openedPeerId, role, hostId, displayName }) => {
      log("peer open", { openedPeerId, role, hostId, displayName });
      setIdentity({ peerId: openedPeerId, role, hostId, displayName });
      setStatus("ready");
    },
    [setIdentity, setStatus]
  );

  const onConnection = useCallback(
    (connection) => {
      setupConnectionLifecycle(connection, { addConnection, removeConnection, addError, setStatus });
    },
    [addConnection, removeConnection, addError, setStatus]
  );

  const onError = useCallback(
    (error) => {
      console.error("[network/bootstrap] peer error", error);
      addError(error);
      setStatus("error");
    },
    [addError, setStatus]
  );

  const bootstrapLocalhost = useCallback(async () => {
    if (peer) {
      log("localhost bootstrap skipped, peer already exists");
      return peer;
    }

    log("localhost bootstrap start");
    const { peer: initializedPeer } = await initLocalhostPeer({ onOpen, onConnection, onError });
    setPeer(initializedPeer);
    log("localhost bootstrap complete");
    return initializedPeer;
  }, [peer, onConnection, onError, onOpen, setPeer]);

  const bootstrapHosted = useCallback(
    async (displayName) => {
      if (peer) {
        log("hosted bootstrap skipped, peer already exists");
        return peer;
      }

      log("hosted bootstrap start", { displayName });
      const { peer: initializedPeer } = await initHostedPeer({ displayName, onOpen, onConnection, onError });
      setPeer(initializedPeer);
      setHostedNameFlowComplete(true);
      log("hosted bootstrap complete", { displayName });
      return initializedPeer;
    },
    [peer, onConnection, onError, onOpen, setPeer, setHostedNameFlowComplete]
  );

  return {
    isLocalhost: isLocalhostEnvironment(),
    bootstrapLocalhost,
    bootstrapHosted,
  };
};
