import React, { useMemo } from 'react'
import * as THREE from 'three'
import GrassTileV2 from './variants/GrassTileV2'
import SandTileV2 from './variants/SandTileV2'
import RockTileV2 from './variants/RockTileV2'
import DebugTileV2 from './variants/DebugTileV2'

export default function TileV2({ position, value, debugTile = false }) {
  // if debug mode is on, skip variant logic
  if (debugTile) {
    return <DebugTileV2 position={position} value={value} />
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
    variant === 'grass' ? GrassTileV2 :
      variant === 'sand' ? SandTileV2 :
        RockTileV2

  // const TileComponent =GrassTileV2

  return <TileComponent position={position} value={value} height={value * 5.8 + 2} onClick={handleClick} />
}

