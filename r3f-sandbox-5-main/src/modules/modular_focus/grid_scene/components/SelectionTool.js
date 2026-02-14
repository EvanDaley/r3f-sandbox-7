import React, { useRef, useState, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGridSceneStore, worldToGrid, gridToWorld } from "../stores/gridSceneStore";

/**
 * SelectionTool
 * 
 * Handles box selection and shift-click selection of objects.
 * Provides visual feedback for selected objects.
 */
export default function SelectionTool() {
  const planeRef = useRef();
  const { camera, mouse, raycaster } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const selectionMode = useGridSceneStore((s) => s.selectionMode);
  const selectedObjectIds = useGridSceneStore((s) => s.selectedObjectIds);
  const selectObject = useGridSceneStore((s) => s.selectObject);
  const selectObjects = useGridSceneStore((s) => s.selectObjects);
  const clearSelection = useGridSceneStore((s) => s.clearSelection);
  const objects = useGridSceneStore((s) => s.objects);
  const moveMode = useGridSceneStore((s) => s.moveMode);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);

  // Keyboard listener for 'M' key to move selected objects
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.key === 'm' || event.key === 'M') && selectedObjectIds.length > 0) {
        event.preventDefault();
        useGridSceneStore.getState().setMoveMode(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectIds]);

  const pasteMode = useGridSceneStore((s) => s.pasteMode);

  // Handle box selection drag
  const handlePointerDown = (event) => {
    if (!selectionMode || moveMode || pasteMode || event.button !== 0) return;

    event.stopPropagation();

    raycasterRef.current.setFromCamera(mouse, camera);
    const intersects = raycasterRef.current.intersectObject(planeRef.current);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const { gridX, gridZ } = worldToGrid(point.x, point.z);

      // Shift-click: toggle selection of object at this position
      if (event.shiftKey) {
        const objectAtPosition = Object.entries(objects).find(
          ([id, obj]) => obj.gridX === gridX && obj.gridZ === gridZ
        );
        if (objectAtPosition) {
          selectObject(objectAtPosition[0]);
        }
      } else {
        // Start box selection
        setIsDragging(true);
        setDragStart({ gridX, gridZ });
        setDragEnd({ gridX, gridZ });
        // Clear selection if not shift-clicking
        clearSelection();
      }
    }
  };

  useFrame(() => {
    if (!isDragging || !selectionMode || moveMode || pasteMode || !planeRef.current) return;

    raycasterRef.current.setFromCamera(mouse, camera);
    const intersects = raycasterRef.current.intersectObject(planeRef.current);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const { gridX, gridZ } = worldToGrid(point.x, point.z);
      setDragEnd({ gridX, gridZ });
    }
  });

  const handlePointerUp = (event) => {
    if (!isDragging || !selectionMode || pasteMode) return;

    setIsDragging(false);

    if (dragStart && dragEnd) {
      // Find all objects within the selection box
      const minX = Math.min(dragStart.gridX, dragEnd.gridX);
      const maxX = Math.max(dragStart.gridX, dragEnd.gridX);
      const minZ = Math.min(dragStart.gridZ, dragEnd.gridZ);
      const maxZ = Math.max(dragStart.gridZ, dragEnd.gridZ);

      const selectedIds = Object.entries(objects)
        .filter(([id, obj]) => {
          return obj.gridX >= minX && obj.gridX <= maxX &&
                 obj.gridZ >= minZ && obj.gridZ <= maxZ;
        })
        .map(([id]) => id);

      selectObjects(selectedIds);
    }

    setDragStart(null);
    setDragEnd(null);
  };

  // Render selection box
  const renderSelectionBox = () => {
    if (!isDragging || !dragStart || !dragEnd) return null;

    const minX = Math.min(dragStart.gridX, dragEnd.gridX);
    const maxX = Math.max(dragStart.gridX, dragEnd.gridX);
    const minZ = Math.min(dragStart.gridZ, dragEnd.gridZ);
    const maxZ = Math.max(dragStart.gridZ, dragEnd.gridZ);

    const width = (maxX - minX + 1);
    const height = (maxZ - minZ + 1);
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const worldPos = gridToWorld(centerX, centerZ);

    return (
      <mesh position={[worldPos.x, 0.01, worldPos.z]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          color="#06d6a0"
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  };

  if (!selectionMode) {
    return null;
  }

  return (
    <>
      {/* Invisible plane for raycasting */}
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        visible={false}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Selection box visualization */}
      {renderSelectionBox()}
    </>
  );
}

