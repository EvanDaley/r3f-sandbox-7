import React from "react";
import * as THREE from "three";

/**
 * CornerWall - An L-shaped corner piece that connects X and Z walls
 * 
 * Designed to fit on a grid cell and connect walls in both X and Z directions.
 * Creates an L-shape with both X and Z wall segments.
 * Height: 1.5 units (Y), positioned so bottom is flush with ground (y=0)
 */
export default function CornerWall({ materials, rotation = 0, position = [0, 0, 0], ...props }) {
  return (
    <group {...props} rotation={[0, rotation, 0]} position={[position[0], 0.75, position[2]]}>
      {/* X-direction wall segment - extends in +X direction from corner */}
      <mesh
        position={[0.45, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.9, 1.5, 0.1]} />
        <meshStandardMaterial
          color={materials?.p?.color || "#8b7355"}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* Z-direction wall segment - extends in +Z direction from corner */}
      <mesh
        position={[0, 0, 0.45]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.1, 1.5, 0.9]} />
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

