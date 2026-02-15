import { create } from 'zustand';
import { applySkillExperience, createProgressionState, progressToNextLevel } from '../core/leveling';
import { RPG_SKILLS } from '../config/progressionConfig';

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
    lastAction: 'Welcome, adventurer.',
    lastExperienceEvent: null,
    addExperience: (skillId, amount, source = 'action', metadata = {}) => {
      const state = get();
      const skills = state.skills.map((skill) => (
        skill.id === skillId ? applySkillExperience(skill, amount) : skill
      ));

      const updatedState = withTotals({ ...state, skills });
      const previousTarget = state.skills.find((skill) => skill.id === skillId);
      const target = updatedState.skills.find((skill) => skill.id === skillId);
      const gain = Math.max(0, amount);
      const levelsGained = target && previousTarget ? Math.max(0, target.level - previousTarget.level) : 0;
      const message = target
        ? `${target.name} +${gain.toFixed(1)}xp from ${source}`
        : state.lastAction;

      set({
        ...updatedState,
        lastAction: message,
        lastExperienceEvent: target
          ? {
            id: `${Date.now()}-${skillId}-${Math.random().toString(36).slice(2, 8)}`,
            skillId,
            source,
            gain,
            levelsGained,
            level: target.level,
            position: metadata.position ?? null,
          }
          : state.lastExperienceEvent,
      });
    },
    resetProgression: () => {
      const resetState = withTotals(createProgressionState(config));
      set({
        ...resetState,
        lastAction: 'Progress reset.',
        lastExperienceEvent: null,
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
  skills: RPG_SKILLS,
  globalCurve: {
    levelCap: 100,
    baseXp: 125,
    exponent: 2.18,
  },
});

export default useRpgProgressionStore;
