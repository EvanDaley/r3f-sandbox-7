import { create } from 'zustand';

const initialState = {
  waveNumber: 0,
  activeEnemies: 0,
  maxEnemies: 0,
  pendingSpawns: 0,
  wallCount: 0,
  amplifierCount: 0,
  turretCount: 0,
  biomass: 0,
  energy: 0,
  carbon: 0,
  uranium: 0,
  crystal: 0,
  buildSelection: 'wall',
  activeAmplifiers: [],
  enemyTypes: [],
};

const useTowerDefenseUiStore = create((set) => ({
  ...initialState,
  setSnapshot: (snapshot) => set(snapshot),
  setBuildSelection: (buildSelection) => set({ buildSelection }),
  reset: () => set(initialState),
}));

export default useTowerDefenseUiStore;
