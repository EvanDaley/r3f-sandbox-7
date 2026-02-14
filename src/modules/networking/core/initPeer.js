import { PEER_SERVER_SETTINGS } from "../config/networkConfig";

let peerInstance = null;

const PEERJS_CDN_URL = "https://esm.sh/peerjs@1.5.4";

async function loadPeerConstructor() {
  if (window.Peer) return window.Peer;

  const module = await import(/* @vite-ignore */ PEERJS_CDN_URL);
  return module.default;
}

export const getPeerInstance = () => peerInstance;

export const initPeer = async (desiredPeerId) => {
  if (peerInstance && !peerInstance.destroyed) {
    return peerInstance;
  }

  const PeerConstructor = await loadPeerConstructor();
  peerInstance = new PeerConstructor(desiredPeerId, PEER_SERVER_SETTINGS);
  return peerInstance;
};

export const resetPeerInstance = () => {
  if (peerInstance && !peerInstance.destroyed) {
    peerInstance.destroy();
  }
  peerInstance = null;
};
