import React from "react";
import { useGridSceneStore, gridToWorld } from "../stores/gridSceneStore";

/**
 * SelectionHighlight
 * 
 * Renders visual highlights for selected objects.
 */
export default function SelectionHighlight({ objectId, object }) {
  const selectedObjectIds = useGridSceneStore((s) => s.selectedObjectIds);
  const isSelected = selectedObjectIds.includes(objectId);

  if (!isSelected) return null;

  const worldPos = gridToWorld(object.gridX, object.gridZ);

  return (
    <mesh position={[worldPos.x, 0.01, worldPos.z]}>
      <boxGeometry args={[1.1, 0.05, 1.1]} />
      <meshBasicMaterial
        color="#06d6a0"
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

