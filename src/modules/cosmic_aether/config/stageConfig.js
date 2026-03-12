export const STAGES = [
  {
    id: "sanctuaryHalo",
    name: "Sanctuary Halo",
    requiredUnlock: null,
    unlocks: "paleGardenAccess",
    description: "Safe spawn sanctuary with starter resources and fabricator access.",
    fogDensity: 0.028,
    accent: "#f3e4b2",
  },
  {
    id: "paleGarden",
    name: "Pale Garden",
    requiredUnlock: "paleGardenAccess",
    unlocks: "choirRuinsAccess",
    description: "A nearby garden-like expanse with luminous resource blooms.",
    fogDensity: 0.035,
    accent: "#cdefff",
  },
  {
    id: "choirRuins",
    name: "Choir Ruins",
    requiredUnlock: "choirRuinsAccess",
    unlocks: null,
    description: "Sacred monoliths and giant arches that foreshadow the wider world.",
    fogDensity: 0.04,
    accent: "#e8d8ff",
  },
];

export const STAGE_BY_ID = Object.fromEntries(STAGES.map((stage) => [stage.id, stage]));

export const RESOURCE_TYPES = {
  PALE_DUST: "Pale Dust",
  LUMEN_SHARD: "Lumen Shard",
  VEIL_FIBER: "Veil Fiber",
  AETHER_PEARL: "Aether Pearl",
};
