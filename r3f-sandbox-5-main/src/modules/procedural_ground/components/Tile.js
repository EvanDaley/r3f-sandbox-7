import React, { useMemo } from 'react'
import * as THREE from 'three'
import GrassTile from './variants/GrassTile'
import SandTile from './variants/SandTile'
import RockTile from './variants/RockTile'
import DebugTile from './variants/DebugTile'

export default function Tile({ position, value, debugTile = false }) {
  // if debug mode is on, skip variant logic
  if (debugTile) {
    return <DebugTile position={position} value={value} />
  }

  const variant = useMemo(() => {
    if (value < -0.8) return 'sand'
    if (value < 0.6) return 'grass'
    return 'rock'
  }, [value])

  const handleClick = (e) => {
    e.stopPropagation()
    const worldPos = e.object.getWorldPosition(new THREE.Vector3())
    console.log(`🟩 ${variant.toUpperCase()} tile clicked at:`, worldPos.x, worldPos.z, 'with value: ', value)
  }

  const TileComponent =
    variant === 'grass' ? GrassTile :
      variant === 'sand' ? SandTile :
        RockTile

  // const TileComponent =GrassTile

  return <TileComponent position={position} value={value} onClick={handleClick} />
}
