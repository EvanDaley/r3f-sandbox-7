import { create } from 'zustand';
import { applySkillExperience, createProgressionState, progressToNextLevel } from '../core/leveling';
import { RPG2_SKILLS } from '../config/progressionConfig';

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

export const createRpg2ProgressionStore = (config) => {
  const initialState = withTotals(createProgressionState(config));

  return create((set, get) => ({
    ...initialState,
    lastAction: 'Welcome, adventurer.',
    addExperience: (skillId, amount, source = 'action') => {
      const state = get();
      const skills = state.skills.map((skill) => (
        skill.id === skillId ? applySkillExperience(skill, amount) : skill
      ));

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
        lastAction: 'Progress reset.',
      });
    },
    getSkillById: (skillId) => get().skills.find((skill) => skill.id === skillId),
    getSkillProgress: (skillId) => {
      const skill = get().skills.find((entry) => entry.id === skillId);
      return skill ? progressToNextLevel(skill.xp, skill.curve) : null;
    },
  }));
};

const useRpg2ProgressionStore = createRpg2ProgressionStore({
  skills: RPG2_SKILLS,
  globalCurve: {
    levelCap: 100,
    baseXp: 125,
    exponent: 2.18,
  },
});

export default useRpg2ProgressionStore;
