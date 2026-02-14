import React from "react";
import * as THREE from "three";

/**
 * WallZ - A wall that extends along the Z axis
 * 
 * Designed to fit on a grid cell and connect with other walls.
 * Width: 0.1 units (X), Depth: 1 unit (Z), Height: 1.5 units (Y)
 * Positioned so bottom is flush with ground (y=0)
 */
export default function WallZ({ materials, position = [0, 0, 0], ...props }) {
  return (
    <mesh
      {...props}
      position={[position[0], 0.75, position[2]]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[0.1, 1.5, 1]} />
      <meshStandardMaterial
        color={materials?.p?.color || "#8b7355"}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

