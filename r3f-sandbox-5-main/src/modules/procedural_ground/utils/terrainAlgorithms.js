import { noise } from "./noise.js"

import { createNoise2D } from 'simplex-noise'
import alea from 'alea'

// Default fractal terrain
export function defaultTerrainAlgorithm({ size, seed }) {
  const data = []
  const half = size / 2
  const octaves = 4
  const persistence = 0.5
  const lacunarity = 2.0
  const offsetX = Math.sin(seed) * 1000
  const offsetY = Math.cos(seed) * 1000

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const centeredX = x - half
      const centeredY = y - half
      const nx = (centeredX + offsetX) / size
      const ny = (centeredY + offsetY) / size

      let frequency = 1.0
      let amplitude = 1.0
      let value = 0.0
      let maxAmplitude = 0.0

      for (let i = 0; i < octaves; i++) {
        value += noise(nx * frequency, ny * frequency, seed + i * 100) * amplitude
        maxAmplitude += amplitude
        amplitude *= persistence
        frequency *= lacunarity
      }

      value /= maxAmplitude

      data.push({
        x: centeredX,
        y: centeredY,
        value,
      })
    }
  }

  return data
}

export function smoothTerrainAlgorithm({ size, seed }) {
  const data = []
  const half = size / 2

  // Terrain parameters — tweak these for different feels
  const octaves = 5
  const persistence = 0.5
  const lacunarity = 2.0
  const scale = 0.15 // lower = smoother terrain

  const offsetX = Math.sin(seed) * 1000
  const offsetY = Math.cos(seed) * 1000

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - half + offsetX) * scale
      const ny = (y - half + offsetY) * scale

      let frequency = 1.0
      let amplitude = 1.0
      let value = 0.0
      let maxAmplitude = 0.0

      for (let i = 0; i < octaves; i++) {
        const n = noise(nx * frequency, ny * frequency, seed + i * 100)
        value += n * amplitude
        maxAmplitude += amplitude
        amplitude *= persistence
        frequency *= lacunarity
      }

      value /= maxAmplitude
      // Optional: add height bias or island falloff
      const distance = Math.sqrt(Math.pow((x - half) / half, 2) + Math.pow((y - half) / half, 2))
      const falloff = Math.max(0, 1 - distance) // smooth fade at edges
      value *= falloff

      data.push({ x: x - half, y: y - half, value })
    }
  }

  return data
}


// Example: flat algorithm for testing
export function flatAlgorithm({ size }) {
  const data = []
  const half = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      data.push({ x: x - half, y: y - half, value: 0 })
    }
  }
  return data
}

// Example: simple random terrain
export function randomAlgorithm({ size }) {
  const data = []
  const half = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      data.push({ x: x - half, y: y - half, value: Math.random() * 2 - 1 })
    }
  }
  return data
}

export function perlinLikeAlgorithm({ size, seed }) {
  const noise2D = createNoise2D(alea(seed)) // ✅ deterministic noise generator
  const data = []
  const half = size / 2
  const scale = 0.05 // larger = more fine detail

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x - half) * scale
      const ny = (y - half) * scale

      // raw simplex noise is already in [-1, 1]
      let value = noise2D(nx, ny)

      // optional: smooth falloff toward edges
      // const dist = Math.sqrt((x - half) ** 2 + (y - half) ** 2) / half
      // const falloff = 1 - dist * dist
      // value *= Math.max(0, falloff)

      data.push({ x: x - half, y: y - half, value })
    }
  }

  return data
}