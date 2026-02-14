import { useCallback } from "react";
import { initHostedPeer } from "../initializers/initHostedPeer";
import { initLocalhostPeer } from "../initializers/initLocalhostPeer";
import { useNetworkingStore } from "../stores/useNetworkingStore";

const isLocalhostEnvironment = () => {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
};

const setupConnectionLifecycle = (connection, actions) => {
  connection.on("open", () => {
    actions.addConnection(connection);
    actions.setStatus("connected");
  });

  connection.on("close", () => {
    actions.removeConnection(connection.peer);
  });

  connection.on("error", (error) => {
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
      addError(error);
      setStatus("error");
    },
    [addError, setStatus]
  );

  const bootstrapLocalhost = useCallback(async () => {
    if (peer) return peer;

    const { peer: initializedPeer } = await initLocalhostPeer({ onOpen, onConnection, onError });
    setPeer(initializedPeer);
    return initializedPeer;
  }, [peer, onConnection, onError, onOpen, setPeer]);

  const bootstrapHosted = useCallback(
    async (displayName) => {
      if (peer) return peer;

      const { peer: initializedPeer } = await initHostedPeer({ displayName, onOpen, onConnection, onError });
      setPeer(initializedPeer);
      setHostedNameFlowComplete(true);
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
