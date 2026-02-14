import React, { useMemo } from 'react'
import TileV2 from './TileV2'
import { generateLevelV2 } from '../utils/generateLevelV2'
import useTerrainStore from '../stores/terrainStore'

export default function TileGridV2({ debugTile = false }) {
  const { size, seed, octaves, persistence, lacunarity } = useTerrainStore()
  
  const tiles = useMemo(() => {
    return generateLevelV2({ 
      size, 
      seed, 
      octaves, 
      persistence, 
      lacunarity
    })
  }, [size, seed, octaves, persistence, lacunarity])

  return (
    <>
      {tiles.map((tile) => (
        <TileV2 
          key={`${tile.x}-${tile.y}`} 
          {...tile} 
          height={tile.height || 0}
          debugTile={debugTile}
        />
      ))}
    </>
  )
}

