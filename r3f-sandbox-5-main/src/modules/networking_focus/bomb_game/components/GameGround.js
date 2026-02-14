import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * A checkerboard-style ground plane for the bomb game
 */
export default function GameGround({ size = 50, gridSize = 10 }) {
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, gridSize, gridSize);
    const mat = new THREE.MeshStandardMaterial({
      color: "#2a2a2a",
      roughness: 0.8,
      metalness: 0.1,
    });

    // Create checkerboard pattern using vertex colors
    const colors = [];
    const positions = geo.attributes.position;
    const color = new THREE.Color();
    const cellSize = size / gridSize;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      
      // Create checkerboard pattern
      const gridX = Math.floor((x + size / 2) / cellSize);
      const gridZ = Math.floor((z + size / 2) / cellSize);
      const isDark = (gridX + gridZ) % 2 === 0;
      
      color.set(isDark ? "#1a1a1a" : "#2a2a2a");
      colors.push(color.r, color.g, color.b);
    }

    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    mat.vertexColors = true;

    return { geometry: geo, material: mat };
  }, [size, gridSize]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      geometry={geometry}
      material={material}
      receiveShadow
    />
  );
}

