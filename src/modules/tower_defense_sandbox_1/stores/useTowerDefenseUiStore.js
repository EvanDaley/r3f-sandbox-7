import { create } from 'zustand';

const initialState = {
  waveNumber: 0,
  activeEnemies: 0,
  maxEnemies: 0,
  pendingSpawns: 0,
  wallCount: 0,
  amplifierCount: 0,
  activeAmplifiers: [],
  enemyTypes: [],
};

const useTowerDefenseUiStore = create((set) => ({
  ...initialState,
  setSnapshot: (snapshot) => set(snapshot),
  reset: () => set(initialState),
}));

export default useTowerDefenseUiStore;
