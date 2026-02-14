import { usePeerStore } from "./stores/peerStore";

export const broadcastMessage = (message, { hostOnly = false } = {}) => {
  const { connections, isHost } = usePeerStore.getState();

  if (hostOnly && !isHost) {
    console.warn("Only hosts can broadcast this type of message");
    return;
  }

  Object.values(connections).forEach(({ conn }) => {
    if (conn && conn.open) {
      conn.send(message);
      console.log(`Sent message to ${conn.peer}`, message);
    }
  });
};
