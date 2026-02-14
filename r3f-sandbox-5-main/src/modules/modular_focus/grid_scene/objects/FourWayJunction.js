import React from "react";
import * as THREE from "three";

/**
 * FourWayJunction - A 4-way junction piece (cross/plus shape)
 * 
 * Wall segments are 0.5 units long and stay within the cell boundaries.
 * Height: 1.5 units (Y), positioned so bottom is flush with ground (y=0)
 * Extends in all 4 directions: +X, -X, +Z, -Z
 * Rotation doesn't change the shape (it's symmetric), but is supported for consistency
 */
export default function FourWayJunction({ materials, rotation = 0, position = [0, 0, 0], ...props }) {
  return (
    <group {...props} rotation={[0, rotation, 0]} position={[position[0], 0.75, position[2]]}>
      {/* X-direction wall segment - extends in +X direction */}
      <mesh
        position={[0.25, 0, 0]}
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
      
      {/* X-direction wall segment - extends in -X direction */}
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
      
      {/* Z-direction wall segment - extends in +Z direction */}
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
      
      {/* Z-direction wall segment - extends in -Z direction */}
      <mesh
        position={[0, 0, -0.25]}
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
      
      {/* Center connection piece */}
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

