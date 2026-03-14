import { PEER_SERVER_SETTINGS } from "../config/networkConfig";

let peerInstance = null;
let peerInitPromise = null;

const PEERJS_CDN_URL = "https://esm.sh/peerjs@1.5.4";

const log = (...args) => {
  // console.log("[network/initPeer]", ...args);
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

  if (peerInitPromise) {
    log("awaiting in-flight peer initialization", { desiredPeerId });
    return peerInitPromise;
  }

  log("creating new peer instance", { desiredPeerId, settings: PEER_SERVER_SETTINGS });

  peerInitPromise = loadPeerConstructor()
    .then((PeerConstructor) => {
      if (peerInstance && !peerInstance.destroyed) {
        return peerInstance;
      }

      peerInstance = new PeerConstructor(desiredPeerId, PEER_SERVER_SETTINGS);
      return peerInstance;
    })
    .finally(() => {
      peerInitPromise = null;
    });

  return peerInitPromise;
};

export const resetPeerInstance = () => {
  if (peerInstance && !peerInstance.destroyed) {
    log("destroying peer instance", { peerId: peerInstance.id });
    peerInstance.destroy();
  }
  peerInstance = null;
  peerInitPromise = null;
};
