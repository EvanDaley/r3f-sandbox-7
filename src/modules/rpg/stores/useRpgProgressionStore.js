import { create } from "zustand";
import {
  applySkillExperience,
  createProgressionState,
  progressToNextLevel,
} from "../core/leveling";

const DEMO_SKILLS = [
  { id: "running", name: "Running", group: "movement", color: "#4cc9f0" },
  { id: "woodcutting", name: "Woodcutting", group: "gathering", color: "#8d6e63" },
  { id: "mining", name: "Mining", group: "gathering", color: "#9e9e9e" },
  { id: "crafting", name: "Crafting", group: "production", color: "#ffb703" },
  { id: "combat", name: "Combat", group: "combat", color: "#ef476f" },
];

const withTotals = (state) => {
  const totals = state.skills.reduce(
    (acc, skill) => {
      acc.totalXp += skill.xp;
      acc.totalLevel += skill.level;
      return acc;
    },
    { totalXp: 0, totalLevel: 0 }
  );

  return {
    ...state,
    ...totals,
  };
};

export const createRpgProgressionStore = (config) => {
  const initialState = withTotals(createProgressionState(config));

  return create((set, get) => ({
    ...initialState,
    lastAction: "Welcome, adventurer.",
    addExperience: (skillId, amount, source = "action") => {
      const state = get();
      const skills = state.skills.map((skill) => {
        if (skill.id !== skillId) {
          return skill;
        }

        return applySkillExperience(skill, amount);
      });

      const updatedState = withTotals({ ...state, skills });
      const target = updatedState.skills.find((skill) => skill.id === skillId);
      const gain = Math.max(0, amount);
      const message = target
        ? `${target.name} +${gain.toFixed(1)}xp from ${source}`
        : state.lastAction;

      set({
        ...updatedState,
        lastAction: message,
      });
    },
    resetProgression: () => {
      const resetState = withTotals(createProgressionState(config));
      set({
        ...resetState,
        lastAction: "Progress reset.",
      });
    },
    getSkillById: (skillId) => get().skills.find((skill) => skill.id === skillId),
    getSkillProgress: (skillId) => {
      const skill = get().skills.find((entry) => entry.id === skillId);
      return skill ? progressToNextLevel(skill.xp, skill.curve) : null;
    },
  }));
};

const useRpgProgressionStore = createRpgProgressionStore({
  skills: DEMO_SKILLS,
  globalCurve: {
    levelCap: 100,
    baseXp: 125,
    exponent: 2.18,
  },
});

export default useRpgProgressionStore;
