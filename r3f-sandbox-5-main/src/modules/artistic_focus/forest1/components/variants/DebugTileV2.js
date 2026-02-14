import React, { useMemo } from 'react'
import * as THREE from 'three'
import {Outlines} from "@react-three/drei";

export default function DebugTileV2({ position, onClick, value }) {
  const { color } = useMemo(() => {
    // const hue = 0.31 + value * 0.01
    const hue = value + .01
    const lightness = 0.38 + (value * -0.05)
    const color = new THREE.Color().setHSL(hue, 0.7, lightness)
    return { color }
  }, [position, value])

  return (
    <mesh
      position={position}
      onClick={onClick}
      receiveShadow
      castShadow
    >
      <boxGeometry args={[1.0, 0.5, 1.0]} />
      <meshToonMaterial color={color} />
      {/*<Outlines/>*/}

      {/*<Outlines*/}
      {/*  thickness={.2}*/}
      {/*  color={"black"}*/}
      {/*  screenspace={true}*/}
      {/*/>*/}
    </mesh>
  )
}

