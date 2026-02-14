import { PEER_SERVER_SETTINGS } from "../config/networkConfig";

let peerInstance = null;

const PEERJS_CDN_URL = "https://esm.sh/peerjs@1.5.4";

const log = (...args) => {
  console.log("[network/initPeer]", ...args);
};

async function loadPeerConstructor() {
  if (window.Peer) {
    log("using window.Peer constructor");
    return window.Peer;
  }

  log("loading PeerJS constructor from CDN", PEERJS_CDN_URL);
  const module = await import(/* @vite-ignore */ PEERJS_CDN_URL);
  return module.default;
}

export const getPeerInstance = () => peerInstance;

export const initPeer = async (desiredPeerId) => {
  if (peerInstance && !peerInstance.destroyed) {
    log("reusing existing peer instance", { peerId: peerInstance.id });
    return peerInstance;
  }

  log("creating new peer instance", { desiredPeerId, settings: PEER_SERVER_SETTINGS });
  const PeerConstructor = await loadPeerConstructor();
  peerInstance = new PeerConstructor(desiredPeerId, PEER_SERVER_SETTINGS);
  return peerInstance;
};

export const resetPeerInstance = () => {
  if (peerInstance && !peerInstance.destroyed) {
    log("destroying peer instance", { peerId: peerInstance.id });
    peerInstance.destroy();
  }
  peerInstance = null;
};
