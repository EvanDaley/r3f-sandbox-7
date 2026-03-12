import { create } from "zustand";
import { RESOURCE_TYPES, STAGE_BY_ID, STAGES } from "../config/stageConfig";

const initialInventory = {
  [RESOURCE_TYPES.PALE_DUST]: 0,
  [RESOURCE_TYPES.LUMEN_SHARD]: 0,
  [RESOURCE_TYPES.VEIL_FIBER]: 0,
  [RESOURCE_TYPES.AETHER_PEARL]: 0,
};

const hasStageAccess = (stageId, unlocks) => {
  const stage = STAGE_BY_ID[stageId];
  if (!stage) return false;
  if (!stage.requiredUnlock) return true;
  return Boolean(unlocks[stage.requiredUnlock]);
};

const useCosmicAetherStore = create((set, get) => ({
  currentStageId: "sanctuaryHalo",
  aether: 100,
  integrity: 100,
  inventory: initialInventory,
  unlocks: {
    paleGardenAccess: false,
    choirRuinsAccess: false,
  },
  message: "Welcome to Cosmic Aether. Gather Pale Dust and unlock your first route.",

  setMessage: (message) => set({ message }),

  gatherResource: (resource, amount = 1) =>
    set((state) => ({
      inventory: {
        ...state.inventory,
        [resource]: (state.inventory[resource] ?? 0) + amount,
      },
    })),

  spendResources: (cost) => {
    const inventory = get().inventory;
    const canAfford = Object.entries(cost).every(([resource, amount]) => (inventory[resource] ?? 0) >= amount);

    if (!canAfford) return false;

    set((state) => {
      const nextInventory = { ...state.inventory };
      Object.entries(cost).forEach(([resource, amount]) => {
        nextInventory[resource] -= amount;
      });
      return { inventory: nextInventory };
    });

    return true;
  },

  unlockTech: (unlockKey) =>
    set((state) => ({
      unlocks: {
        ...state.unlocks,
        [unlockKey]: true,
      },
    })),

  setStage: (stageId) => {
    const unlocks = get().unlocks;
    if (!hasStageAccess(stageId, unlocks)) return false;
    set({ currentStageId: stageId, aether: 100 });
    return true;
  },

  drainAether: (delta) =>
    set((state) => ({
      aether: Math.max(0, state.aether - delta),
    })),

  refillAether: () => set({ aether: 100 }),

  damageIntegrity: (amount) =>
    set((state) => ({
      integrity: Math.max(0, state.integrity - amount),
    })),

  repairIntegrity: () => set({ integrity: 100 }),

  canAccessStage: (stageId) => hasStageAccess(stageId, get().unlocks),

  getStageList: () => STAGES,
}));

export default useCosmicAetherStore;
