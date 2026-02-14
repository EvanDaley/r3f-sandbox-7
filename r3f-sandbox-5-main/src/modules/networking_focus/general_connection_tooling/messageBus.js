// messageBus.js
import mitt from "mitt";
import { broadcastMessage } from "./broadcastMessage";
import { usePeerStore } from "./stores/peerStore";

const emitter = mitt();

/**
 * Publish-subscribe message bus for local + networked communication.
 *
 * Groups are arbitrary strings that represent event channels.
 * Broadcast messages are automatically sent to peers via PeerJS.
 */
export const messageBus = {
  subscribe(group, handler) {
    emitter.on(group, handler);
    return () => emitter.off(group, handler);
  },

  publish(group, message) {
    emitter.emit(group, message);
  },

  broadcast(group, type, payload, senderId = null) {
    const { peerId } = usePeerStore.getState();
    const sender = senderId || peerId;

    // include sender so we can prevent local echo
    const message = {
      scene: "bus",
      type,
      payload: { group, original_sender: sender, ...payload },
    };

    // emit locally first
    emitter.emit(group, message);

    // send to connected peers
    broadcastMessage(message);
  },
};
