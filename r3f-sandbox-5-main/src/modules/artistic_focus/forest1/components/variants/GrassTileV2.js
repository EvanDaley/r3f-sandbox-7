import React, { useMemo } from 'react'
import * as THREE from 'three'
import {Outlines} from "@react-three/drei";

export default function GrassTileV2({ position, onClick, value, height = 0 }) {
  const { color, scale, rotation } = useMemo(() => {
    // More natural green hues with better variation
    const hue = 0.25 + value * 0.15 // 0.25-0.4 range for green tones
    const saturation = 0.6 + value * 0.2 // 0.6-0.8 for rich greens
    const lightness = 0.35 + (value * -0.08) // 0.35-0.43 for natural grass
    const color = new THREE.Color().setHSL(hue, saturation, lightness)
    
    // Subtle variation for visual interest
    const seed = Math.abs(Math.sin(position[0] * 7.3 + position[2] * 11.7)) % 1
    const scaleX = 1.0 + (seed - 0.5) * 0.02
    const scaleZ = 1.0 + (seed - 0.5) * 0.02
    const rotation = (seed - 0.5) * 0.05
    
    return { color, scale: [scaleX, 1, scaleZ], rotation }
  }, [position, value])

  // Adjust height based on value - make tiles taller for higher terrain
  const tileHeight = 0.3 + Math.max(0, height) * 0.3

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

