import create from "zustand"

export const useAbilityStore = create((set, get) => ({
  abilities: [
    { id: 1, name: "🔥 Fireball", emoji: "🔥", charge: 0 },
    { id: 2, name: "💧 Ice Spike", emoji: "💧", charge: 0 },
    { id: 3, name: "⚡ Lightning", emoji: "⚡", charge: 0 },
    { id: 4, name: "🌪️ Tornado", emoji: "🌪️", charge: 0 },
  ],

  selectedAbilityId: null,

  tick: () => {
    set((state) => ({
      abilities: state.abilities.map((a) => {
        // if (a.charge < 1) {
        //   console.log(a.charge)
        // }
        return {
          ...a,
          charge: Math.min(a.charge + .01, 1), // ✅ new objects each frame
        }
      }),
    }))
  },

  selectAbility: (id) => set({ selectedAbilityId: id }),

  castAbility: (id) =>
    set((state) => ({
      abilities: state.abilities.map((a) =>
        a.id === id ? { ...a, charge: 0 } : a
      ),
      // selectedAbilityId: null,
    })),

  getSelectedAbility: () =>
    get().abilities.find((a) => a.id === get().selectedAbilityId),
}))
