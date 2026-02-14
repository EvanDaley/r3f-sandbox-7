export const PLAYER_STATE_CHANNEL = "player:state";
export const PLAYER_STATE_UPDATE = "update";
export const PLAYER_STATE_REMOVE = "remove";

const POSITION_DECIMALS = 2;
const ROTATION_DECIMALS = 3;

const roundTo = (value, decimals) => Number(value.toFixed(decimals));

export const serializePlayerState = ({ peerId, position, rotation, animation }) => ({
  peerId,
  position: {
    x: roundTo(position.x, POSITION_DECIMALS),
    y: roundTo(position.y, POSITION_DECIMALS),
    z: roundTo(position.z, POSITION_DECIMALS),
  },
  rotation: {
    x: roundTo(rotation.x, ROTATION_DECIMALS),
    y: roundTo(rotation.y, ROTATION_DECIMALS),
    z: roundTo(rotation.z, ROTATION_DECIMALS),
    w: roundTo(rotation.w, ROTATION_DECIMALS),
  },
  animation: animation ?? "Idle",
  ts: Date.now(),
});

export const isPlayerStateMessage = (message) =>
  message?.channel === PLAYER_STATE_CHANNEL &&
  (message?.type === PLAYER_STATE_UPDATE || message?.type === PLAYER_STATE_REMOVE);
