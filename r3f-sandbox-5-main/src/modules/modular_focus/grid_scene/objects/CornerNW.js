import React from "react";
import * as THREE from "three";

/**
 * CornerNW - An L-shaped corner piece facing Northwest (-X, +Z)
 * 
 * Wall segments are 0.5 units long and stay within the cell boundaries.
 * Height: 1.5 units (Y), positioned so bottom is flush with ground (y=0)
 */
export default function CornerNW({ materials, position = [0, 0, 0], ...props }) {
  return (
    <group {...props} position={[position[0], 0.75, position[2]]}>
      {/* X-direction wall segment - extends in -X direction from corner */}
      <mesh
        position={[-0.25, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.5, 1.5, 0.1]} />
        <meshStandardMaterial
          color={materials?.p?.color || "#8b7355"}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Z-direction wall segment - extends in +Z direction from corner */}
      <mesh
        position={[0, 0, 0.25]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.1, 1.5, 0.5]} />
        <meshStandardMaterial
          color={materials?.p?.color || "#8b7355"}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Corner connection piece - small cube at the intersection */}
      <mesh
        position={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.1, 1.5, 0.1]} />
        <meshStandardMaterial
          color={materials?.p?.color || "#8b7355"}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

