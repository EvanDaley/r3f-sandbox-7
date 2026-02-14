import { useNetworkingStore } from "../stores/useNetworkingStore";

export const NETWORK_MESSAGE_EVENT = "networking:message";

const log = (...args) => {
  console.log("[network]", ...args);
};

export const createNetworkMessage = ({ channel, type, payload, senderPeerId }) => ({
  channel,
  type,
  payload,
  senderPeerId,
  timestamp: Date.now(),
});

export const dispatchIncomingNetworkMessage = (message, fromPeerId) => {
  if (!message || typeof message !== "object") return;

  log("incoming message", { fromPeerId, channel: message.channel, type: message.type, payload: message.payload });

  window.dispatchEvent(
    new CustomEvent(NETWORK_MESSAGE_EVENT, {
      detail: {
        ...message,
        fromPeerId,
      },
    })
  );
};

export const subscribeToNetworkMessages = (handler) => {
  const wrappedHandler = (event) => handler(event.detail);
  window.addEventListener(NETWORK_MESSAGE_EVENT, wrappedHandler);
  return () => window.removeEventListener(NETWORK_MESSAGE_EVENT, wrappedHandler);
};

export const broadcastNetworkMessage = ({ channel, type, payload }) => {
  const { activeConnections, peerId } = useNetworkingStore.getState();
  const message = createNetworkMessage({
    channel,
    type,
    payload,
    senderPeerId: peerId,
  });

  log("broadcast message", {
    channel,
    type,
    peerId,
    connectionCount: Object.keys(activeConnections).length,
    payload,
  });

  Object.values(activeConnections).forEach((connection) => {
    if (!connection?.open) return;
    connection.send(message);
  });

  return message;
};
