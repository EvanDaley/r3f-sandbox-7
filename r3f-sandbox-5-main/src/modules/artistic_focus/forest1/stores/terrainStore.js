import create from 'zustand'

const useTerrainStore = create((set) => ({
  // Terrain generation parameters (matching defaultTerrainAlgorithm pattern)
  size: 30,
  seed: 0,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2.0,
  
  // Update functions
  setSize: (size) => set({ size }),
  setSeed: (seed) => set({ seed }),
  setOctaves: (octaves) => set({ octaves }),
  setPersistence: (persistence) => set({ persistence }),
  setLacunarity: (lacunarity) => set({ lacunarity }),
}))

export default useTerrainStore

