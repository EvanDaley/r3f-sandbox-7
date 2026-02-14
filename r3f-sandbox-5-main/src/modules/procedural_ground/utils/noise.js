import { createNoise2D } from 'simplex-noise'

const noise2D = createNoise2D()

export function noise(x, y, seed = 0) {
  return noise2D(x + seed, y + seed)
}
