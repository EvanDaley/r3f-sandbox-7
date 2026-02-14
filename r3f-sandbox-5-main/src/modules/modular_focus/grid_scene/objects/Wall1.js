import React from "react";
import * as THREE from "three";

/**
 * Wall1 - A simple wall object that fits on a grid cell
 * 
 * This is a basic wall component. You can replace this with a more
 * sophisticated model later (e.g., using PaletteModel with a GLB file).
 */
export default function Wall1({ materials, rotation = 0, ...props }) {
  return (
    <mesh
      {...props}
      rotation={[0, rotation, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial
        color={materials?.p?.color || "#8b7355"}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

