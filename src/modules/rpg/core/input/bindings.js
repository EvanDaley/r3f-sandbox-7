export const DEFAULT_RPG_BINDINGS = Object.freeze({
  moveForward: [{ type: "keyboard", code: "KeyW" }],
  moveBackward: [{ type: "keyboard", code: "KeyS" }],
  moveLeft: [{ type: "keyboard", code: "KeyA" }],
  moveRight: [{ type: "keyboard", code: "KeyD" }],
  interact: [{ type: "keyboard", code: "KeyE" }],
  resetProgression: [{ type: "keyboard", code: "KeyR" }],
  cameraRotate: [{ type: "mouse", button: 1 }],
});

export const mergeBindings = (baseBindings, overrideBindings = {}) => ({
  ...baseBindings,
  ...overrideBindings,
});

export const createInputSnapshot = () => ({
  keyboard: new Set(),
  mouse: new Set(),
});
