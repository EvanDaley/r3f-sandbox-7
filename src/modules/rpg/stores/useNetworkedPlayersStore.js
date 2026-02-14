import { create } from "zustand";

const STALE_PLAYER_TIMEOUT_MS = 6000;

export const useNetworkedPlayersStore = create((set, get) => ({
  remotePlayers: {},
  upsertRemotePlayer: (playerState) => {
    if (!playerState?.peerId) return;

    set((state) => ({
      remotePlayers: {
        ...state.remotePlayers,
        [playerState.peerId]: {
          ...state.remotePlayers[playerState.peerId],
          ...playerState,
          updatedAt: Date.now(),
        },
      },
    }));
  },
  removeRemotePlayer: (peerId) => {
    set((state) => {
      if (!state.remotePlayers[peerId]) return state;
      const nextPlayers = { ...state.remotePlayers };
      delete nextPlayers[peerId];
      return { remotePlayers: nextPlayers };
    });
  },
  pruneStalePlayers: () => {
    const now = Date.now();
    const remotePlayers = get().remotePlayers;
    const nextPlayers = Object.fromEntries(
      Object.entries(remotePlayers).filter(([, player]) => now - player.updatedAt < STALE_PLAYER_TIMEOUT_MS)
    );

    if (Object.keys(nextPlayers).length !== Object.keys(remotePlayers).length) {
      set({ remotePlayers: nextPlayers });
    }
  },
}));
