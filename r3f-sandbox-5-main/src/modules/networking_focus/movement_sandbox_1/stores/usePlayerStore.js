// stores/usePlayerStore.js
import create from 'zustand';

export const usePlayerStore = create((set, get) => ({
  players: {}, // { peerId: { x, y, z, rotation? } }

  setPlayerPosition: (peerId, position) =>
    set((state) => ({
      players: {
        ...state.players,
        [peerId]: { ...state.players[peerId], ...position },
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
