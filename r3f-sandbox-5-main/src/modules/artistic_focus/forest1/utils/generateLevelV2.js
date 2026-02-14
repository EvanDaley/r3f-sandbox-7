import { createDeterministicNoise } from "./deterministicNoise.js"

// Real-time terrain generation function
// Based on defaultTerrainAlgorithm but with configurable parameters
// Uses deterministic noise for repeatable, procedural generation
export function generateLevelV2({ 
  size = 30, 
  seed = 0, 
  octaves = 4, 
  persistence = 0.5, 
  lacunarity = 2.0,
  tileSize = 1 
}) {
  const data = []
  const half = size / 2
  
  // Create a deterministic noise function for this seed
  // This ensures the same seed always produces the same noise values
  const noise = createDeterministicNoise(seed)
  
  // Deterministic offsets based on seed (same seed = same terrain)
  const offsetX = Math.sin(seed) * 1000
  const offsetY = Math.cos(seed) * 1000

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const centeredX = x - half
      const centeredY = y - half
      
      // Normalize coordinates by size (matches defaultTerrainAlgorithm pattern)
      const nx = (centeredX + offsetX) / size
      const ny = (centeredY + offsetY) / size

      // Fractal noise with multiple octaves
      let frequency = 1.0
      let amplitude = 1.0
      let value = 0.0
      let maxAmplitude = 0.0

      for (let i = 0; i < octaves; i++) {
        // Use deterministic noise with octave offset
        // This ensures each octave is different but the whole thing is repeatable
        value += noise(nx * frequency, ny * frequency, i * 100) * amplitude
        maxAmplitude += amplitude
        amplitude *= persistence
        frequency *= lacunarity
      }

      // Normalize the value
      value /= maxAmplitude

      // Calculate height based on value (higher values = higher terrain)
      const height = value * 0.8 // Scale height variation

      data.push({
        x: centeredX,
        y: centeredY,
        value,
        height,
        position: [centeredX * tileSize, height - 0.24, centeredY * tileSize],
      })
    }
  }

  return data
}

