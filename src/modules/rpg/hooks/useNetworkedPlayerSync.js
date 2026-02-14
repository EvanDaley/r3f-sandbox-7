import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { broadcastNetworkMessage, subscribeToNetworkMessages } from "@/modules/networking/core/networkEvents";
import { useNetworkingStore } from "@/modules/networking/stores/useNetworkingStore";
import { useGame } from "@/modules/third_person_controller/stores/useGame";
import {
  isPlayerStateMessage,
  PLAYER_STATE_CHANNEL,
  PLAYER_STATE_REMOVE,
  PLAYER_STATE_UPDATE,
  serializePlayerState,
} from "@/modules/rpg/networking/playerNetworkProtocol";
import { useNetworkedPlayersStore } from "@/modules/rpg/stores/useNetworkedPlayersStore";

const SEND_INTERVAL_MS = 100;
const KEEP_ALIVE_MS = 1000;
const POSITION_DELTA_THRESHOLD = 0.03;
const ROTATION_DELTA_THRESHOLD = 0.02;

const hasSignificantDelta = (previousState, nextState) => {
  if (!previousState) return true;

  const posDelta =
    Math.abs(nextState.position.x - previousState.position.x) +
    Math.abs(nextState.position.y - previousState.position.y) +
    Math.abs(nextState.position.z - previousState.position.z);

  const rotDelta =
    Math.abs(nextState.rotation.x - previousState.rotation.x) +
    Math.abs(nextState.rotation.y - previousState.rotation.y) +
    Math.abs(nextState.rotation.z - previousState.rotation.z) +
    Math.abs(nextState.rotation.w - previousState.rotation.w);

  return (
    posDelta > POSITION_DELTA_THRESHOLD ||
    rotDelta > ROTATION_DELTA_THRESHOLD ||
    previousState.animation !== nextState.animation
  );
};

export const useNetworkedPlayerSync = ({ controllerRef }) => {
  const localPeerId = useNetworkingStore((state) => state.peerId);
  const curAnimation = useGame((state) => state.curAnimation);
  const upsertRemotePlayer = useNetworkedPlayersStore((state) => state.upsertRemotePlayer);
  const removeRemotePlayer = useNetworkedPlayersStore((state) => state.removeRemotePlayer);
  const pruneStalePlayers = useNetworkedPlayersStore((state) => state.pruneStalePlayers);

  const lastSentAtRef = useRef(0);
  const lastSentStateRef = useRef(null);
  const lastKeepAliveAtRef = useRef(0);

  const animationName = useMemo(() => curAnimation ?? "Idle", [curAnimation]);

  useEffect(() => {
    const unsubscribe = subscribeToNetworkMessages((message) => {
      if (!isPlayerStateMessage(message)) return;

      if (message.type === PLAYER_STATE_REMOVE) {
        removeRemotePlayer(message.payload?.peerId);
        return;
      }

      const senderPeerId = message.payload?.peerId ?? message.senderPeerId ?? message.fromPeerId;
      if (!senderPeerId || senderPeerId === localPeerId) return;

      upsertRemotePlayer({
        peerId: senderPeerId,
        position: message.payload.position,
        rotation: message.payload.rotation,
        animation: message.payload.animation,
        ts: message.payload.ts,
      });
    });

    const pruneInterval = window.setInterval(pruneStalePlayers, 2000);
    return () => {
      unsubscribe();
      window.clearInterval(pruneInterval);
    };
  }, [localPeerId, pruneStalePlayers, removeRemotePlayer, upsertRemotePlayer]);

  useEffect(() => {
    return () => {
      if (!localPeerId) return;
      broadcastNetworkMessage({
        channel: PLAYER_STATE_CHANNEL,
        type: PLAYER_STATE_REMOVE,
        payload: { peerId: localPeerId },
      });
    };
  }, [localPeerId]);

  useFrame(() => {
    if (!localPeerId) return;

    const body = controllerRef.current?.group;
    if (!body) return;

    const now = Date.now();
    if (now - lastSentAtRef.current < SEND_INTERVAL_MS) return;

    const translation = body.translation();
    const rotation = body.rotation();

    const nextState = serializePlayerState({
      peerId: localPeerId,
      position: translation,
      rotation,
      animation: animationName,
    });

    const shouldForceKeepAlive = now - lastKeepAliveAtRef.current >= KEEP_ALIVE_MS;
    if (!shouldForceKeepAlive && !hasSignificantDelta(lastSentStateRef.current, nextState)) {
      return;
    }

    lastSentAtRef.current = now;
    if (shouldForceKeepAlive) {
      lastKeepAliveAtRef.current = now;
    }
    lastSentStateRef.current = nextState;

    broadcastNetworkMessage({
      channel: PLAYER_STATE_CHANNEL,
      type: PLAYER_STATE_UPDATE,
      payload: nextState,
    });
  });
};
