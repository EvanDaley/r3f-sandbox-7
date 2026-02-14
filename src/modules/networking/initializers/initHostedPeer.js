import { EVAN_HOST_NAME, HOST_PEER_ID } from "../config/networkConfig";
import { initPeer } from "../core/initPeer";
import { NETWORK_ROLE } from "../stores/useNetworkingStore";

const normalizeName = (name) => name.trim().toLowerCase();

export const initHostedPeer = async ({ displayName, onOpen, onConnection, onError }) => {
  const isHost = normalizeName(displayName) === normalizeName(EVAN_HOST_NAME);
  const role = isHost ? NETWORK_ROLE.HOST : NETWORK_ROLE.CLIENT;
  const desiredPeerId = isHost ? HOST_PEER_ID : undefined;

  const peer = await initPeer(desiredPeerId);

  peer.on("open", (openedPeerId) => {
    onOpen?.({ openedPeerId, role, hostId: HOST_PEER_ID, displayName });

    if (!isHost) {
      const hostConnection = peer.connect(HOST_PEER_ID, { reliable: true });
      onConnection?.(hostConnection);
    }
  });

  peer.on("connection", (connection) => onConnection?.(connection));
  peer.on("error", (error) => onError?.(error));

  return { peer, role, hostId: HOST_PEER_ID };
};
