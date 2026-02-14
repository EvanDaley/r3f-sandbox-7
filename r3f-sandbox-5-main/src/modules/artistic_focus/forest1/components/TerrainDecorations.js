import React, { useMemo } from 'react'
import useTerrainStore from '../stores/terrainStore'
import { generateLevelV2 } from '../utils/generateLevelV2'
import TreeApprox1 from '../../../dynamic_colors/objects/TreeApprox1'
import { usePaletteStore } from '../../../dynamic_colors/stores/paletteStore'

function Tree({ position, scale = 1, rotation = 0 }) {
  const activePalette = usePaletteStore((s) => s.activePalette)

  if (!activePalette) return null

  return (
    <TreeApprox1
      materials={activePalette}
      position={position}
      scale={scale}
      rotation={[0, rotation, 0]}
    />
  )
}

export default function TerrainDecorations() {
  const { size, seed, octaves, persistence, lacunarity } = useTerrainStore()
  
  const decorations = useMemo(() => {
    const tiles = generateLevelV2({ size, seed, octaves, persistence, lacunarity })
    const items = []

    tiles.forEach((tile) => {
      // Determine tile type
      const isGrass = tile.value >= -0.8 && tile.value < 0.6
      const isRock = tile.value >= 0.6
      
      // Place trees on grass tiles (higher value = more likely, but not too high)
      if (isGrass && tile.value > -0.3 && tile.value < 0.4) {
        // Use deterministic seeds for consistent placement
        const treeSeed = Math.abs(Math.sin(tile.x * 17.3 + tile.y * 23.7 + seed)) % 1
        const offsetSeed = Math.abs(Math.sin(tile.x * 31.1 + tile.y * 47.3 + seed)) % 1
        const scaleSeed = Math.abs(Math.sin(tile.x * 19.7 + tile.y * 29.1 + seed)) % 1
        const rotSeed = Math.abs(Math.sin(tile.x * 41.3 + tile.y * 53.7 + seed)) % 1
        
        // Place trees with some probability (higher on better grass areas)
        const treeProbability = (tile.value + 0.3) * 0.1 // 0 to ~0.07 probability (reduced from 0.28)
        if (treeSeed < treeProbability) {
          const treeX = tile.position[0] + (offsetSeed - 0.5) * 0.6
          const treeZ = tile.position[2] + ((offsetSeed * 1.7) % 1 - 0.5) * 0.6
          const treeY = (tile.height || 0) + 0.1 // Slightly above terrain
          const treeScale = 0.8 + scaleSeed * 0.4 // 0.8 to 1.2
          const treeRotation = rotSeed * Math.PI * 2
          
          items.push({
            type: 'tree',
            position: [treeX, treeY, treeZ],
            scale: treeScale,
            rotation: treeRotation,
          })
        }
      }
      
      // Place rocks on rock tiles occasionally
      if (isRock) {
        const rockSeed = Math.abs(Math.sin(tile.x * 13.1 + tile.y * 19.9 + seed)) % 1
        if (rockSeed < 0.15) { // 15% chance
          const offsetSeed = Math.abs(Math.sin(tile.x * 37.2 + tile.y * 43.8 + seed)) % 1
          const scaleSeed = Math.abs(Math.sin(tile.x * 23.5 + tile.y * 31.9 + seed)) % 1
          const rotSeed = Math.abs(Math.sin(tile.x * 51.3 + tile.y * 61.7 + seed)) % 1
          
          const rockX = tile.position[0] + (offsetSeed - 0.5) * 0.7
          const rockZ = tile.position[2] + ((offsetSeed * 1.3) % 1 - 0.5) * 0.7
          const rockY = (tile.height || 0) + 0.05
          const rockScale = 0.3 + scaleSeed * 0.4
          const rockRotation = rotSeed * Math.PI * 2
          
          items.push({
            type: 'rock',
            position: [rockX, rockY, rockZ],
            scale: rockScale,
            rotation: rockRotation,
          })
        }
      }
    })

    return items
  }, [size, seed, octaves, persistence, lacunarity])

  return (
    <>
      {decorations.map((item, index) => {
        if (item.type === 'tree') {
          return (
            <Tree
              key={`tree-${index}`}
              position={item.position}
              scale={item.scale}
              rotation={item.rotation}
            />
          )
        }
        // Rocks can be added later when you create a rock model
        return null
      })}
    </>
  )
}

