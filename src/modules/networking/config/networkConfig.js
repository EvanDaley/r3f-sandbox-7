export const HOST_PEER_ID = "game-host-666";
export const EVAN_HOST_NAME = "Evan D";

export const LOCALHOST_HOST_PORT = Number(import.meta.env.VITE_LOCALHOST_HOST_PORT || 5173);

// Reused from the prior initPeer setup so all environments point to the same self-hosted PeerJS server.
export const PEER_SERVER_SETTINGS = {
  host: "peer.makingstuffwithevan.com",
  port: 443,
  path: "/peerjs",
  secure: true,
  config: {
    iceServers: [
      { urls: "stun:54.190.188.230:3478" },
      {
        urls: "turn:54.190.188.230:3478?transport=udp",
        username: "testuser",
        credential: "testpass",
      },
      {
        urls: "turn:54.190.188.230:3478?transport=tcp",
        username: "testuser",
        credential: "testpass",
      },
    ],
  },
};
