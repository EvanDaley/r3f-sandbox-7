import React, { useMemo } from 'react'
import * as THREE from 'three'
import {Outlines} from "@react-three/drei";

export default function RockTile({ position, onClick, value }) {
  const { color, scale, rotation } = useMemo(() => {
    // Stable seed based on tile position
    const seed = Math.abs(Math.sin(position[0] * 12.9898 + position[2] * 78.233)) % 1

    // Subtle variation in hue/lightness for gray tones
    const hue = 0.0 // grayscale
    const lightness = 0.3 + seed * 0.15 // between 0.3–0.45
    const color = new THREE.Color().setHSL(hue, 0, lightness)

    // Mild variation in size (stays close to 1)
    const scaleX = 1 + (seed - 0.5) * 0.1
    const scaleY = 1 + (seed - 0.5) * 0.15
    const scaleZ = 1 + (seed - 0.5) * 0.1

    // Small rotation only
    const rotation = (seed - 0.5) * 0.15 // ~±0.075 radians

    return {
      color,
      scale: [scaleX, scaleY, scaleZ],
      rotation,
    }
  }, [position])

  return (
    <mesh
      position={position}
      onClick={onClick}
      rotation={[0, rotation, 0]}
      scale={scale}
      receiveShadow={true}
    >
      <boxGeometry args={[1, .5, 1]} />
      <meshToonMaterial color={color} />
      {/*<Outlines/>*/}
    </mesh>
  )
}
