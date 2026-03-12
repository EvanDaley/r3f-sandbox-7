import { create } from "zustand";
import { RESOURCE_TYPES, STAGE_BY_ID, STAGES } from "../config/stageConfig";

const MAX_AETHER_BY_LEVEL = [100, 130, 165, 205, 250];

const RECIPES = {
  reservoir1: {
    id: "reservoir1",
    name: "Aether Reservoir I",
    description: "+30 max Aether",
    requirement: (state) => state.reservoirLevel === 0,
    cost: {
      [RESOURCE_TYPES.PALE_DUST]: 4,
      [RESOURCE_TYPES.VEIL_FIBER]: 2,
    },
    apply: (state) => ({
      reservoirLevel: 1,
      maxAether: MAX_AETHER_BY_LEVEL[1],
      aether: MAX_AETHER_BY_LEVEL[1],
    }),
  },
  scanner: {
    id: "scanner",
    name: "Aether Scanner",
    description: "Unlocks crystal and pearl tracking",
    requirement: (state) => state.reservoirLevel >= 1 && !state.unlockedTools.scanner,
    cost: {
      [RESOURCE_TYPES.LUMEN_SHARD]: 3,
      [RESOURCE_TYPES.PALE_DUST]: 2,
    },
    apply: () => ({
      unlockedTools: {
        scanner: true,
        beacon: false,
      },
    }),
  },
  beacon: {
    id: "beacon",
    name: "Pulse Beacon",
    description: "Unlocks route guidance between shrines",
    requirement: (state) => state.unlockedTools.scanner && !state.unlockedTools.beacon,
    cost: {
      [RESOURCE_TYPES.LUMEN_SHARD]: 2,
      [RESOURCE_TYPES.VEIL_FIBER]: 2,
    },
    apply: () => ({
      unlockedTools: {
        scanner: true,
        beacon: true,
      },
    }),
  },
};

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

const OBJECTIVES = [
  "Gather 6 Pale Dust in Sanctuary Halo.",
  "Craft Aether Reservoir I in the Fabricator panel.",
  "Attune Pale Garden Route at the sanctuary shrine.",
  "Gather 4 Lumen Shards and 1 Aether Pearl.",
  "Craft Aether Scanner, then attune Choir Ruins Route.",
  "Travel to Choir Ruins and collect advanced resources.",
];

const checkObjectiveProgress = (state) => {
  const paleDust = state.inventory[RESOURCE_TYPES.PALE_DUST] ?? 0;
  const lumen = state.inventory[RESOURCE_TYPES.LUMEN_SHARD] ?? 0;
  const pearl = state.inventory[RESOURCE_TYPES.AETHER_PEARL] ?? 0;

  if (state.objectiveIndex === 0 && paleDust >= 6) return 1;
  if (state.objectiveIndex === 1 && state.reservoirLevel >= 1) return 2;
  if (state.objectiveIndex === 2 && state.unlocks.paleGardenAccess) return 3;
  if (state.objectiveIndex === 3 && lumen >= 4 && pearl >= 1) return 4;
  if (state.objectiveIndex === 4 && state.unlockedTools.scanner && state.unlocks.choirRuinsAccess) return 5;
  return state.objectiveIndex;
};

const useCosmicAetherStore = create((set, get) => ({
  currentStageId: "sanctuaryHalo",
  maxAether: MAX_AETHER_BY_LEVEL[0],
  aether: MAX_AETHER_BY_LEVEL[0],
  integrity: 100,
  reservoirLevel: 0,
  inventory: initialInventory,
  unlocks: {
    paleGardenAccess: false,
    choirRuinsAccess: false,
  },
  unlockedTools: {
    scanner: false,
    beacon: false,
  },
  objectiveIndex: 0,
  message: "Welcome to Cosmic Aether. Gather Pale Dust and prepare to expand.",
  menuTab: "objectives",

  setMenuTab: (menuTab) => set({ menuTab }),
  setMessage: (message) => set({ message }),

  gatherResource: (resource, amount = 1) =>
    set((state) => {
      const next = {
        ...state,
        inventory: {
          ...state.inventory,
          [resource]: (state.inventory[resource] ?? 0) + amount,
        },
      };
      const objectiveIndex = checkObjectiveProgress(next);
      return {
        inventory: next.inventory,
        objectiveIndex,
        message: `Gathered ${amount} ${resource}.`,
      };
    }),

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

  craftRecipe: (recipeId) => {
    const recipe = RECIPES[recipeId];
    const state = get();
    if (!recipe) return false;
    if (!recipe.requirement(state)) {
      set({ message: `Recipe requirements not met: ${recipe.name}.` });
      return false;
    }

    const spent = state.spendResources(recipe.cost);
    if (!spent) {
      set({ message: `Missing resources for ${recipe.name}.` });
      return false;
    }

    set((current) => {
      const applied = recipe.apply(current);
      const mergedTools = applied.unlockedTools
        ? { ...current.unlockedTools, ...applied.unlockedTools }
        : current.unlockedTools;
      const next = {
        ...current,
        ...applied,
        unlockedTools: mergedTools,
        message: `${recipe.name} crafted. ${recipe.description}`,
      };
      return {
        ...applied,
        unlockedTools: mergedTools,
        objectiveIndex: checkObjectiveProgress(next),
        message: next.message,
      };
    });

    return true;
  },

  getRecipes: () => Object.values(RECIPES),

  unlockTech: (unlockKey) =>
    set((state) => {
      const unlocks = {
        ...state.unlocks,
        [unlockKey]: true,
      };
      const next = { ...state, unlocks };
      return {
        unlocks,
        objectiveIndex: checkObjectiveProgress(next),
      };
    }),

  setStage: (stageId) => {
    const unlocks = get().unlocks;
    const maxAether = get().maxAether;
    if (!hasStageAccess(stageId, unlocks)) return false;
    set({ currentStageId: stageId, aether: maxAether });
    return true;
  },

  drainAether: (delta) =>
    set((state) => ({
      aether: Math.max(0, state.aether - delta),
    })),

  refillAether: () => set((state) => ({ aether: state.maxAether })),

  damageIntegrity: (amount) =>
    set((state) => ({
      integrity: Math.max(0, state.integrity - amount),
    })),

  repairIntegrity: () => set({ integrity: 100 }),

  canAccessStage: (stageId) => hasStageAccess(stageId, get().unlocks),
  getStageList: () => STAGES,
  getObjectives: () => OBJECTIVES,
}));

export default useCosmicAetherStore;
