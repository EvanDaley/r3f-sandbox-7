import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGridSceneStore, worldToGrid } from "../stores/gridSceneStore";

/**
 * GridInteraction
 * 
 * Handles clicking on the grid to place objects.
 * Creates an invisible plane at y=0 for raycasting.
 */
export default function GridInteraction() {
  const planeRef = useRef();
  const { camera, mouse } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const selectedObjectType = useGridSceneStore((s) => s.selectedObjectType);
  const deleteMode = useGridSceneStore((s) => s.deleteMode);
  const rotationMode = useGridSceneStore((s) => s.rotationMode);
  const selectionMode = useGridSceneStore((s) => s.selectionMode);
  const moveMode = useGridSceneStore((s) => s.moveMode);
  const previewRotation = useGridSceneStore((s) => s.previewRotation);
  const overwrite = useGridSceneStore((s) => s.overwrite);
  const setSelectedObjectType = useGridSceneStore((s) => s.setSelectedObjectType);
  const rotatePreview = useGridSceneStore((s) => s.rotatePreview);
  const addObject = useGridSceneStore((s) => s.addObject);
  const objects = useGridSceneStore((s) => s.objects);
  const removeObject = useGridSceneStore((s) => s.removeObject);
  const rotateObject = useGridSceneStore((s) => s.rotateObject);

  const undo = useGridSceneStore((s) => s.undo);
  const redo = useGridSceneStore((s) => s.redo);
  const copySelectedObjects = useGridSceneStore((s) => s.copySelectedObjects);
  const selectedObjectIds = useGridSceneStore((s) => s.selectedObjectIds);
  const pasteMode = useGridSceneStore((s) => s.pasteMode);
  const pasteObjects = useGridSceneStore((s) => s.pasteObjects);
  const setPasteMode = useGridSceneStore((s) => s.setPasteMode);
  const saveToHistory = useGridSceneStore((s) => s.saveToHistory);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Undo: Ctrl+Z (or Cmd+Z on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z (or Cmd+Shift+Z on Mac)
      if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        redo();
        return;
      }

      // Copy: Ctrl+C (or Cmd+C on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        if (selectedObjectIds.length > 0) {
          event.preventDefault();
          copySelectedObjects();
        }
        return;
      }

      // Cancel paste: Escape key
      if (event.key === 'Escape' && pasteMode) {
        event.preventDefault();
        setPasteMode(false);
        return;
      }

      // Delete selected objects: 'x' or 'X' key
      if ((event.key === 'x' || event.key === 'X') && selectedObjectIds.length > 0) {
        event.preventDefault();
        const store = useGridSceneStore.getState();
        // Save history before deleting
        store.saveToHistory();
        // Delete all selected objects
        selectedObjectIds.forEach((id) => {
          store._removeObjectInternal(id);
        });
        // Clear selection after deleting
        store.clearSelection();
        return;
      }

      // Rotate preview: 'r' key when an object type is selected
      if (event.key === 'r' || event.key === 'R') {
        if (selectedObjectType) {
          event.preventDefault();
          rotatePreview();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectType, rotatePreview, undo, redo, copySelectedObjects, selectedObjectIds, pasteMode, setPasteMode, saveToHistory]);

  const handlePointerDown = (event) => {
    // Don't interfere with selection mode or move mode
    // But allow paste mode to work
    if ((selectionMode || moveMode) && !pasteMode) return;

    // Right-click (button 2) - cancel paste or disable tools
    if (event.button === 2) {
      event.stopPropagation();
      const store = useGridSceneStore.getState();
      if (pasteMode) {
        setPasteMode(false);
        return;
      }
      // If delete or rotation mode is active, disable them
      if (deleteMode) {
        store.setDeleteMode(false);
        return;
      }
      if (rotationMode) {
        store.setRotationMode(false);
        return;
      }
      // If selection mode is active, clear selection
      if (selectionMode) {
        store.clearSelection();
      }
      return;
    }

    // Only handle left-click (button 0)
    // Ignore middle-click (button 1) for panning/rotating
    if (event.button !== 0) return;

    event.stopPropagation();

    // Update raycaster with current mouse position
    raycaster.current.setFromCamera(mouse, camera);

    // Raycast against the ground plane
    const intersects = raycaster.current.intersectObject(planeRef.current);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const { gridX, gridZ } = worldToGrid(point.x, point.z);
      
      // Delete mode - remove object at this grid position
      if (deleteMode) {
        // Find object at this grid position
        const objectAtPosition = Object.entries(objects).find(
          ([id, obj]) => obj.gridX === gridX && obj.gridZ === gridZ
        );
        
        if (objectAtPosition) {
          removeObject(objectAtPosition[0]);
        }
        return;
      }
      
      // Rotation mode - rotate object at this grid position by 90 degrees
      if (rotationMode) {
        // Find object at this grid position
        const objectAtPosition = Object.entries(objects).find(
          ([id, obj]) => obj.gridX === gridX && obj.gridZ === gridZ
        );
        
        if (objectAtPosition) {
          rotateObject(objectAtPosition[0]);
        }
        return;
      }
      
      // Paste mode - paste copied objects
      if (pasteMode) {
        pasteObjects();
        return;
      }

      // Placement mode - place object
      if (selectedObjectType) {
        // Check if there's already an object at this position
        const objectAtPosition = Object.entries(objects).find(
          ([id, obj]) => obj.gridX === gridX && obj.gridZ === gridZ
        );
        
        // Only place if position is empty or overwrite is enabled
        if (!objectAtPosition || overwrite) {
          const store = useGridSceneStore.getState();
          
          // Save history once for the entire operation (overwrite or place)
          store.saveToHistory();
          
          // If overwrite is enabled and there's an existing object, remove it first
          if (overwrite && objectAtPosition) {
            // Remove without saving history (we already saved it above)
            store._removeObjectInternal(objectAtPosition[0]);
          }
          
          console.log(`Placing ${selectedObjectType} at:`);
          console.log(`  Grid coordinates: (${gridX}, ${gridZ})`);
          console.log(`  World coordinates: (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`);
          
          // Add object without saving history (we already saved it above)
          store._addObjectInternal(selectedObjectType, gridX, gridZ, previewRotation);
        }
      }
    }
  };

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

