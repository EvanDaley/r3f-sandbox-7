// stores/usePlayerStoreV4.js
import create from "zustand";

export const usePlayerStoreV4 = create((set, get) => ({
  players: {}, // { peerId: { x, y, z, rotation } }

  setPlayerTransform: (peerId, transform) =>
    set((state) => ({
      players: {
        ...state.players,
        [peerId]: { ...state.players[peerId], ...transform },
      },
    })),

  removePlayer: (peerId) =>
    set((state) => {
      const next = { ...state.players };
      delete next[peerId];
      return { players: next };
    }),

  resetPlayers: () => set({ players: {} }),
}));

