import { HOST_PEER_ID, LOCALHOST_HOST_PORT } from "../config/networkConfig";
import { initPeer } from "../core/initPeer";
import { NETWORK_ROLE } from "../stores/useNetworkingStore";

const getRoleForPort = (port) => {
  if (!Number.isFinite(port)) return NETWORK_ROLE.HOST;
  return port <= LOCALHOST_HOST_PORT ? NETWORK_ROLE.HOST : NETWORK_ROLE.CLIENT;
};

export const initLocalhostPeer = async ({ onOpen, onConnection, onError }) => {
  const currentPort = Number(window.location.port);
  const role = getRoleForPort(currentPort);

  const desiredPeerId = role === NETWORK_ROLE.HOST ? HOST_PEER_ID : undefined;
  const peer = await initPeer(desiredPeerId);

  peer.on("open", (openedPeerId) => {
    onOpen?.({ openedPeerId, role, hostId: HOST_PEER_ID, displayName: role === NETWORK_ROLE.HOST ? "Evan D" : "Local Client" });

    if (role === NETWORK_ROLE.CLIENT) {
      const hostConnection = peer.connect(HOST_PEER_ID, { reliable: true });
      onConnection?.(hostConnection);
    }
  });

  peer.on("connection", (connection) => onConnection?.(connection));
  peer.on("error", (error) => onError?.(error));

  return { peer, role, hostId: HOST_PEER_ID };
};
