export const DEFAULT_LEVEL_CURVE = Object.freeze({
  levelCap: 100,
  baseXp: 100,
  exponent: 2.15,
});

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const normalizeCurve = (curve = {}) => ({
  ...DEFAULT_LEVEL_CURVE,
  ...curve,
});

export const xpRequiredForLevel = (level, curve) => {
  const { baseXp, exponent, levelCap } = normalizeCurve(curve);
  const boundedLevel = clamp(Math.floor(level), 1, levelCap);

  if (boundedLevel <= 1) {
    return 0;
  }

  return Math.floor(baseXp * Math.pow(boundedLevel - 1, exponent));
};

export const levelFromXp = (xp, curve) => {
  const { levelCap } = normalizeCurve(curve);
  const safeXp = Math.max(0, xp);
  let low = 1;
  let high = levelCap;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const xpAtMid = xpRequiredForLevel(mid, curve);
    const xpAtNext = mid === levelCap ? Infinity : xpRequiredForLevel(mid + 1, curve);

    if (safeXp >= xpAtMid && safeXp < xpAtNext) {
      return mid;
    }

    if (safeXp < xpAtMid) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return levelCap;
};

export const progressToNextLevel = (xp, curve) => {
  const normalizedCurve = normalizeCurve(curve);
  const level = levelFromXp(xp, normalizedCurve);

  if (level >= normalizedCurve.levelCap) {
    return {
      level,
      percentage: 100,
      currentLevelXp: xpRequiredForLevel(level, normalizedCurve),
      nextLevelXp: xpRequiredForLevel(level, normalizedCurve),
      remainingXp: 0,
    };
  }

  const currentLevelXp = xpRequiredForLevel(level, normalizedCurve);
  const nextLevelXp = xpRequiredForLevel(level + 1, normalizedCurve);
  const span = Math.max(1, nextLevelXp - currentLevelXp);
  const safeXp = Math.max(0, xp);
  const progress = ((safeXp - currentLevelXp) / span) * 100;

  return {
    level,
    percentage: clamp(progress, 0, 100),
    currentLevelXp,
    nextLevelXp,
    remainingXp: Math.max(0, nextLevelXp - safeXp),
  };
};

export const createSkillProgress = (skill, curveOverride) => {
  const curve = normalizeCurve({ ...curveOverride, ...(skill.curve ?? {}) });

  return {
    ...skill,
    curve,
    xp: 0,
    level: 1,
    progress: progressToNextLevel(0, curve),
    unlocked: skill.unlocked ?? true,
  };
};

export const createProgressionState = ({ skills = [], globalCurve } = {}) => ({
  globalCurve: normalizeCurve(globalCurve),
  skills: skills.map((skill) => createSkillProgress(skill, globalCurve)),
  totalXp: 0,
  totalLevel: skills.length,
});

export const applySkillExperience = (skill, amount) => {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;

  if (!skill.unlocked || safeAmount === 0) {
    return skill;
  }

  const xp = skill.xp + safeAmount;
  const progress = progressToNextLevel(xp, skill.curve);

  return {
    ...skill,
    xp,
    level: progress.level,
    progress,
  };
};
