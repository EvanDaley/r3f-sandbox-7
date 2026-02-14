import { createNoise2D } from 'simplex-noise'
import alea from 'alea'

// Create a deterministic noise function that uses seeded generators
// This ensures the same seed always produces the same noise values
export function createDeterministicNoise(seed) {
  // Create a seeded random number generator
  const rng = alea(seed)
  // Create a noise generator with the seeded RNG
  const noise2D = createNoise2D(rng)
  
  // Return a function that uses this seeded noise generator
  return (x, y, octaveSeed = 0) => {
    // Use octaveSeed to vary each octave while maintaining determinism
    return noise2D(x + octaveSeed, y + octaveSeed)
  }
}

// Helper function that creates a deterministic noise function for a given seed
// This matches the pattern used in defaultTerrainAlgorithm
export function deterministicNoise(x, y, seed, octaveOffset = 0) {
  // Create a noise generator seeded with the main seed
  const rng = alea(seed)
  const noise2D = createNoise2D(rng)
  
  // Add octaveOffset to vary octaves deterministically
  return noise2D(x + octaveOffset, y + octaveOffset)
}

