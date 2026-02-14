# Procedural Generation System

## Overview
All terrain generation is **deterministic and repeatable**. Given the same parameters (size, seed, octaves, persistence, lacunarity), the exact same terrain will be generated every time.

## Core Algorithm
The terrain generation uses `generateLevelV2`, which is based on `defaultTerrainAlgorithm` from the procedural_ground module. It uses:

- **Fractal Noise**: Multiple octaves of noise for natural-looking terrain
- **Deterministic Seeds**: All randomness is seeded, ensuring repeatability
- **Noise Function**: Uses `noise()` from `procedural_ground/utils/noise.js` which uses simplex-noise

## Deterministic Components

### 1. Terrain Generation (`generateLevelV2`)
- Uses `noise(x, y, seed + i * 100)` for each octave
- Offset calculated from seed: `Math.sin(seed) * 1000` and `Math.cos(seed) * 1000`
- Same seed = same terrain pattern

### 2. Tile Variations
- **Grass/Sand/Rock tiles**: Use deterministic seeds based on position
  - `Math.sin(position[0] * multiplier + position[2] * multiplier)`
  - Same position = same variation (scale, rotation, color)
  - These are independent of the terrain seed (they vary by position only)

### 3. Object Placement (`TerrainDecorations`)
- **Tree placement**: Uses deterministic seeds based on tile position + terrain seed
  - `Math.sin(tile.x * 17.3 + tile.y * 23.7 + seed)`
  - Same seed + same tile = same tree placement
- **Rock placement**: Similar deterministic approach
- All variations (position offset, scale, rotation) use seeded randomness

## Parameters

All parameters are stored in `terrainStore` and affect generation:

- **size**: Grid size (10-50)
- **seed**: Main seed for terrain (0-1000) - changing this creates completely different terrain
- **octaves**: Number of noise layers (1-8) - more = more detail
- **persistence**: How much each octave contributes (0.1-1.0) - higher = more variation
- **lacunarity**: Frequency multiplier between octaves (1.0-4.0) - higher = more detail

## Repeatability Guarantee

✅ **Same parameters = Same output**
- Terrain shape is identical
- Tile variations are identical
- Object placement is identical
- Colors are identical

This makes it perfect for:
- Saving/loading terrain configurations
- Sharing seeds with others
- Debugging and testing
- Consistent gameplay

