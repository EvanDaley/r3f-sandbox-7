import * as commonHandlers from "./handlers/common";
import { messageBus } from "./messageBus";
import { usePeerStore } from "./stores/peerStore";

const HANDLERS = {
  common: commonHandlers,
};


// --- ROUTER ENTRYPOINT ------------------------------------------

// Deliver the payload we received into local handler methods.
// Note that ANY hook in our project can publish and subscribe to peer events.
// Feature A talks to Feature A (routing messages to itself subscribed on another machine).
// This is intended for CLIENT-TO-CLIENT communication, not communication between random parts of the app.
// Do NOT use this to couple components to each other within the same instance of the application.
// To keep things organized, keep the publisher and handler logic next to each other - either in the same file or
// small isolated subfolders.

export const routeMessage = (fromPeerId, message) => {
  const { scene } = message;

  if (scene === "bus") {
    handleBusMessage(fromPeerId, message);
  } else {
    handleLegacyMessage(fromPeerId, message);
  }
};


// --- NEW WAY ----------------------------------------------------
// MessageBus-based routing (preferred moving forward)
function handleBusMessage(fromPeerId, message) {
  const { payload, type } = message;
  const { peerId } = usePeerStore.getState?.() || {};

  // Skip our own messages
  if (payload?.sender && payload.sender === peerId) return;

  if (payload?.group) {
    messageBus.publish(payload.group, { fromPeerId, type, payload });
  } else {
    console.warn("Bus message missing group:", message);
  }
}

// --- OLD WAY ----------------------------------------------------
// Legacy handler-based routing for backwards compatibility
function handleLegacyMessage(fromPeerId, message) {
  const { scene, type, payload } = message;

  const handlers = HANDLERS[scene] || {};
  const handler = handlers[type] || commonHandlers[type];

  if (handler) {
    handler(fromPeerId, payload);
  } else {
    console.warn(`No handler for message: ${scene}/${type}`);
  }
}

