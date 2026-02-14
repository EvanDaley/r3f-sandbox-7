import React from "react";
import * as THREE from "three";

/**
 * WallX - A wall that extends along the X axis
 * 
 * Designed to fit on a grid cell and connect with other walls.
 * Width: 1 unit (X), Depth: 0.1 units (Z), Height: 1.5 units (Y)
 * Positioned so bottom is flush with ground (y=0)
 */
export default function WallX({ materials, position = [0, 0, 0], ...props }) {
  return (
    <mesh
      {...props}
      position={[position[0], 0.75, position[2]]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1.5, 0.1]} />
      <meshStandardMaterial
        color={materials?.p?.color || "#8b7355"}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

