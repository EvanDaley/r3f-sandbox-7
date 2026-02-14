import { useCallback } from "react";
import { initHostedPeer } from "../initializers/initHostedPeer";
import { initLocalhostPeer } from "../initializers/initLocalhostPeer";
import { useNetworkingStore } from "../stores/useNetworkingStore";

const isLocalhostEnvironment = () => {
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
};

const setupConnectionLifecycle = (connection, store) => {
  connection.on("open", () => {
    store.addConnection(connection);
    store.setStatus("connected");
  });

  connection.on("close", () => {
    store.removeConnection(connection.peer);
  });

  connection.on("error", (error) => {
    store.addError(error);
    store.setStatus("error");
  });
};

export const useNetworkingBootstrap = () => {
  const store = useNetworkingStore();

  const onOpen = useCallback(
    ({ openedPeerId, role, hostId, displayName }) => {
      store.setIdentity({ peerId: openedPeerId, role, hostId, displayName });
      store.setStatus("ready");
    },
    [store]
  );

  const onConnection = useCallback(
    (connection) => {
      setupConnectionLifecycle(connection, store);
    },
    [store]
  );

  const onError = useCallback(
    (error) => {
      store.addError(error);
      store.setStatus("error");
    },
    [store]
  );

  const bootstrapLocalhost = useCallback(async () => {
    if (store.peer) return store.peer;

    const { peer } = await initLocalhostPeer({ onOpen, onConnection, onError });
    store.setPeer(peer);
    return peer;
  }, [onConnection, onError, onOpen, store]);

  const bootstrapHosted = useCallback(
    async (displayName) => {
      if (store.peer) return store.peer;

      const { peer } = await initHostedPeer({ displayName, onOpen, onConnection, onError });
      store.setPeer(peer);
      store.setHostedNameFlowComplete(true);
      return peer;
    },
    [onConnection, onError, onOpen, store]
  );

  return {
    isLocalhost: isLocalhostEnvironment(),
    bootstrapLocalhost,
    bootstrapHosted,
  };
};
