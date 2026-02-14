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


let localhostBootstrapPromise = null;
let hostedBootstrapPromise = null;

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
  const status = useNetworkingStore((state) => state.status);
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

    if (status === "connecting" && localhostBootstrapPromise) {
      log("localhost bootstrap awaiting in-flight init");
      return localhostBootstrapPromise;
    }

    log("localhost bootstrap start");
    setStatus("connecting");

    localhostBootstrapPromise = initLocalhostPeer({ onOpen, onConnection, onError })
      .then(({ peer: initializedPeer }) => {
        setPeer(initializedPeer);
        log("localhost bootstrap complete");
        return initializedPeer;
      })
      .finally(() => {
        localhostBootstrapPromise = null;
      });

    return localhostBootstrapPromise;
  }, [peer, status, onConnection, onError, onOpen, setPeer, setStatus]);

  const bootstrapHosted = useCallback(
    async (displayName) => {
      if (peer) {
        log("hosted bootstrap skipped, peer already exists");
        return peer;
      }

      if (status === "connecting" && hostedBootstrapPromise) {
        log("hosted bootstrap awaiting in-flight init", { displayName });
        return hostedBootstrapPromise;
      }

      log("hosted bootstrap start", { displayName });
      setStatus("connecting");

      hostedBootstrapPromise = initHostedPeer({ displayName, onOpen, onConnection, onError })
        .then(({ peer: initializedPeer }) => {
          setPeer(initializedPeer);
          setHostedNameFlowComplete(true);
          log("hosted bootstrap complete", { displayName });
          return initializedPeer;
        })
        .finally(() => {
          hostedBootstrapPromise = null;
        });

      return hostedBootstrapPromise;
    },
    [peer, status, onConnection, onError, onOpen, setPeer, setHostedNameFlowComplete, setStatus]
  );

  return {
    isLocalhost: isLocalhostEnvironment(),
    bootstrapLocalhost,
    bootstrapHosted,
  };
};
