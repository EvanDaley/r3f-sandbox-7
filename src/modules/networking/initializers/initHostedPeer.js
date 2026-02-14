import { EVAN_HOST_NAME, HOST_PEER_ID } from "../config/networkConfig";
import { initPeer } from "../core/initPeer";
import { NETWORK_ROLE } from "../stores/useNetworkingStore";

const log = (...args) => {
  console.log("[network/hosted]", ...args);
};

const normalizeName = (name) => name.trim().toLowerCase();

export const initHostedPeer = async ({ displayName, onOpen, onConnection, onError }) => {
  const isHost = normalizeName(displayName) === normalizeName(EVAN_HOST_NAME);
  const role = isHost ? NETWORK_ROLE.HOST : NETWORK_ROLE.CLIENT;
  const desiredPeerId = isHost ? HOST_PEER_ID : undefined;

  log("resolved hosted role", { displayName, role, desiredPeerId });

  const peer = await initPeer(desiredPeerId);

  peer.on("open", (openedPeerId) => {
    log("peer open", { openedPeerId, role });
    onOpen?.({ openedPeerId, role, hostId: HOST_PEER_ID, displayName });

    if (!isHost) {
      log("client attempting connection to host", { hostId: HOST_PEER_ID });
      const hostConnection = peer.connect(HOST_PEER_ID, { reliable: true });
      onConnection?.(hostConnection);
    }
  });

  peer.on("connection", (connection) => {
    log("incoming connection", { peer: connection.peer });
    onConnection?.(connection);
  });

  peer.on("error", (error) => {
    console.error("[network/hosted] peer error", error);
    onError?.(error);
  });

  return { peer, role, hostId: HOST_PEER_ID };
};
