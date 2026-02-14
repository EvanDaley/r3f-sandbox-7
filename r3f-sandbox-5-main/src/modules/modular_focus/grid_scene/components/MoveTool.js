import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGridSceneStore, worldToGrid } from "../stores/gridSceneStore";

/**
 * MoveTool
 * 
 * Handles moving selected objects as a group.
 * Objects maintain their relative positions to each other.
 */
export default function MoveTool() {
  const planeRef = useRef();
  const { camera, mouse, raycaster } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const moveMode = useGridSceneStore((s) => s.moveMode);
  const selectedObjectIds = useGridSceneStore((s) => s.selectedObjectIds);
  const objects = useGridSceneStore((s) => s.objects);
  const setMoveOffset = useGridSceneStore((s) => s.setMoveOffset);
  const applyMove = useGridSceneStore((s) => s.applyMove);
  const setMoveMode = useGridSceneStore((s) => s.setMoveMode);
  const clearSelection = useGridSceneStore((s) => s.clearSelection);

  const moveStartRef = useRef(null);
  const originalPositionsRef = useRef(new Map());

  // Initialize move: store original positions
  useEffect(() => {
    if (moveMode && selectedObjectIds.length > 0) {
      selectedObjectIds.forEach((id) => {
        const obj = objects[id];
        if (obj) {
          originalPositionsRef.current.set(id, { gridX: obj.gridX, gridZ: obj.gridZ });
        }
      });
    } else {
      originalPositionsRef.current.clear();
      moveStartRef.current = null;
    }
  }, [moveMode, selectedObjectIds, objects]);

  // Track mouse position for moving
  useFrame(() => {
    if (!moveMode || selectedObjectIds.length === 0 || !planeRef.current) return;

    raycasterRef.current.setFromCamera(mouse, camera);
    const intersects = raycasterRef.current.intersectObject(planeRef.current);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const { gridX, gridZ } = worldToGrid(point.x, point.z);

      if (!moveStartRef.current) {
        // Calculate center of selection
        const selectedObjs = selectedObjectIds
          .map(id => objects[id])
          .filter(Boolean);
        
        if (selectedObjs.length > 0) {
          const centerX = selectedObjs.reduce((sum, obj) => sum + obj.gridX, 0) / selectedObjs.length;
          const centerZ = selectedObjs.reduce((sum, obj) => sum + obj.gridZ, 0) / selectedObjs.length;
          moveStartRef.current = { gridX: centerX, gridZ: centerZ };
        } else {
          moveStartRef.current = { gridX, gridZ };
        }
      }

      // Calculate offset from selection center to mouse position
      const offsetX = gridX - moveStartRef.current.gridX;
      const offsetZ = gridZ - moveStartRef.current.gridZ;
      setMoveOffset(offsetX, offsetZ);
    }
  });

  // Handle click to confirm move or escape to cancel
  useEffect(() => {
    if (!moveMode) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // Cancel move
        setMoveMode(false);
        setMoveOffset(0, 0);
        moveStartRef.current = null;
        originalPositionsRef.current.clear();
      } else if (event.key === 'Enter' || event.key === ' ') {
        // Confirm move
        event.preventDefault();
        applyMove();
        setMoveMode(false);
        clearSelection();
        moveStartRef.current = null;
        originalPositionsRef.current.clear();
      }
    };

    const handleClick = (event) => {
      if (event.button === 0 && !event.shiftKey) {
        // Confirm move on left-click (but not shift-click)
        applyMove();
        setMoveMode(false);
        // Keep selection so user can move again if needed
        moveStartRef.current = null;
        originalPositionsRef.current.clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClick);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [moveMode, applyMove, setMoveMode, setMoveOffset, clearSelection]);

  if (!moveMode) {
    return (
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    );
  }

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      visible={false}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

