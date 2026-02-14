import React, { useMemo } from "react";
import * as THREE from "three";
import { GRID_CELL_SIZE } from "../stores/gridSceneStore";

/**
 * GridVisualization
 * 
 * Renders a visual grid to help users see grid cells.
 */
export default function GridVisualization({ size = 20, showGrid = true }) {
  const gridHelper = useMemo(() => {
    if (!showGrid) return null;
    return new THREE.GridHelper(size, size, 0x444444, 0x222222);
  }, [size, showGrid]);

  if (!showGrid) return null;

  return (
    <primitive object={gridHelper} />
  );
}

