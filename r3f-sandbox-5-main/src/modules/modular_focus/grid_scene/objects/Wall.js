import React from "react";
import * as THREE from "three";

/**
 * Wall - A wall that can be rotated to extend along X or Z axis
 * 
 * Designed to fit on a grid cell and connect with other walls.
 * Width: 1 unit (X), Depth: 0.1 units (Z), Height: 1.5 units (Y)
 * Positioned so bottom is flush with ground (y=0)
 * Rotation: 0° = extends along X, 90° = extends along Z
 */
export default function Wall({ materials, rotation = 0, position = [0, 0, 0], ...props }) {
  return (
    <mesh
      {...props}
      position={[position[0], 0.75, position[2]]}
      rotation={[0, rotation, 0]}
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

