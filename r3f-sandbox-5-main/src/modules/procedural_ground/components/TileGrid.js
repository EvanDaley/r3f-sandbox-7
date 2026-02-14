import React, { useMemo } from 'react'
import Tile from './Tile'
import { loadLevel } from '../utils/loadLevel'

export default function TileGrid({ debugTile = false }) {
  const tiles = useMemo(() => loadLevel(), [])

  return (
    <>
      {tiles.map((tile) => (
        <Tile key={`${tile.x}-${tile.y}`} {...tile} debugTile={debugTile}/>
      ))}
    </>
  )
}
