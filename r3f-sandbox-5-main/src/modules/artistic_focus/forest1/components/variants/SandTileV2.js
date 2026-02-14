import React, { useMemo } from 'react'
import * as THREE from 'three'
import {Outlines} from "@react-three/drei";

export default function SandTileV2({ position, onClick, height = 0 }) {
  const { color, scale, rotation } = useMemo(() => {
    // Stable seed based on tile position (consistent across renders)
    const seed = Math.abs(Math.sin(position[0] * 43.37 + position[2] * 19.23)) % 1

    // Warmer, more saturated sand colors
    const hue = 0.1 + (seed - 0.5) * 0.15   // 0.025-0.175 range (yellow to orange)
    const saturation = 0.5 + (seed - 0.5) * 0.2 // 0.4-0.6 for richer sand
    const lightness = 0.7 + (seed - 0.5) * 0.1 // 0.65-0.75 for bright sand
    const color = new THREE.Color().setHSL(hue, saturation, lightness)

    // Reduced scaling to prevent gaps - keep tiles connected
    const scaleX = 1.0 + (seed - 0.5) * 0.02 // Very subtle variation
    const scaleZ = 1.0 + (seed - 0.5) * 0.02

    // Subtle rotation
    const rotation = (seed - 0.5) * 0.08 // about ±4.5 degrees

    return {
      color,
      scale: [scaleX, 1, scaleZ],
      rotation,
    }
  }, [position])

  // Sand tiles are flatter, but still have some height variation
  const tileHeight = 0.25 + Math.max(0, height) * 0.2

  return (
    <mesh
      position={position}
      onClick={onClick}
      rotation={[0, rotation, 0]}
      scale={scale}
      receiveShadow={true}
      castShadow={true}
    >
      <boxGeometry args={[1.0, tileHeight, 1.0]} />
      <meshToonMaterial color={color} />
    </mesh>
  )
}

