import React, { useMemo } from 'react'
import * as THREE from 'three'
import {Outlines} from "@react-three/drei";

export default function SandTile({ position, onClick }) {
  const { color, scale, rotation } = useMemo(() => {
    // Stable seed based on tile position (consistent across renders)
    const seed = Math.abs(Math.sin(position[0] * 43.37 + position[2] * 19.23)) % 1

    // Warm yellow/beige base with subtle variation
    const hue = 0.12 + (seed - 0.5) * -0.2   // slightly shifts between yellow/orange
    const lightness = 0.65 + (seed - 0.5) * 0.1 // 0.6–0.7
    const color = new THREE.Color().setHSL(hue, 0.4, lightness)

    // Gentle height/size variation to mimic dunes
    const scaleX = 1 + (seed - 0.5) * 0.05
    const scaleY = 0.9 + (seed - 0.5) * 0.1 // a bit flatter overall
    const scaleZ = 1 + (seed - 0.5) * 0.05

    // Subtle rotation
    const rotation = (seed - 0.5) * 0.1 // about ±6 degrees

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
