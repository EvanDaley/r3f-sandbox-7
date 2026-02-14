import React, { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGridSceneStore, worldToGrid, gridToWorld } from "../stores/gridSceneStore";
import Wall from "../objects/Wall";
import Corner from "../objects/Corner";
import TJunction from "../objects/TJunction";
import FourWayJunction from "../objects/FourWayJunction";
import Desk1 from "../../../dynamic_colors/objects/Desk1";
import Turret1 from "../../../dynamic_colors/objects/Turret1";
import { usePaletteStore } from "../../../dynamic_colors/stores/paletteStore";

/**
 * CopyPastePreview
 * 
 * Shows a semi-transparent preview of copied objects that will be pasted
 * as the mouse moves around the scene. Maintains relative positions.
 */
export default function CopyPastePreview() {
  const planeRef = useRef();
  const previewRefs = useRef(new Map());
  const { camera, mouse, raycaster } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const pasteMode = useGridSceneStore((s) => s.pasteMode);
  const copiedObjects = useGridSceneStore((s) => s.copiedObjects);
  const setPasteAnchor = useGridSceneStore((s) => s.setPasteAnchor);
  const overwrite = useGridSceneStore((s) => s.overwrite);
  const objects = useGridSceneStore((s) => s.objects);
  const activePalette = usePaletteStore((s) => s.activePalette);
  const [previewPosition, setPreviewPosition] = React.useState(null);
  const materialBackupsRef = useRef(new Map());

  // Cleanup: Reset materials when preview disappears
  useEffect(() => {
    if (!pasteMode || !previewPosition) {
      // Reset all materials that were modified
      materialBackupsRef.current.forEach((backup, material) => {
        if (material && backup) {
          material.opacity = backup.opacity;
          material.transparent = backup.transparent;
          if (material.emissive) {
            material.emissive.copy(backup.emissive);
            material.emissiveIntensity = backup.emissiveIntensity;
          }
        }
      });
      materialBackupsRef.current.clear();
    }
  }, [pasteMode, previewPosition]);

  useFrame(() => {
    if (!pasteMode || !copiedObjects || copiedObjects.length === 0 || !planeRef.current) {
      setPreviewPosition(null);
      return;
    }

    // Update raycaster with current mouse position
    raycasterRef.current.setFromCamera(mouse, camera);

    // Raycast against the ground plane
    const intersects = raycasterRef.current.intersectObject(planeRef.current);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const { gridX, gridZ } = worldToGrid(point.x, point.z);
      const worldPos = gridToWorld(gridX, gridZ);

      // Update paste anchor position
      setPasteAnchor(gridX, gridZ);
      setPreviewPosition([worldPos.x, worldPos.y, worldPos.z]);

      // Update preview materials for transparency
      previewRefs.current.forEach((ref, index) => {
        if (ref && ref.current) {
          const copiedObj = copiedObjects[index];
          if (!copiedObj) return;

          const newGridX = gridX + copiedObj.relativeX;
          const newGridZ = gridZ + copiedObj.relativeZ;

          // Check if position is valid based on overwrite setting
          const objectAtPosition = Object.values(objects).find(
            (obj) => obj.gridX === newGridX && obj.gridZ === newGridZ
          );
          
          // Position is valid if it's empty OR overwrite is enabled
          const valid = !objectAtPosition || overwrite;
          const opacity = valid ? 0.4 : 0.2;

          ref.current.traverse((child) => {
            if (child.isMesh && child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((mat) => {
                if (mat && copiedObj.type !== 'desk' && copiedObj.type !== 'turret') {
                  // Backup original material properties if not already backed up
                  if (!materialBackupsRef.current.has(mat)) {
                    materialBackupsRef.current.set(mat, {
                      opacity: mat.opacity,
                      transparent: mat.transparent,
                      emissive: mat.emissive ? mat.emissive.clone() : null,
                      emissiveIntensity: mat.emissiveIntensity || 0,
                    });
                  }

                  mat.transparent = true;
                  mat.opacity = opacity;
                  if (!valid) {
                    // Show red when position is invalid (occupied and overwrite disabled)
                    if (!mat.emissive) mat.emissive = new THREE.Color();
                    mat.emissive.setHex(0xff0000);
                    mat.emissiveIntensity = 0.3;
                  } else {
                    if (mat.emissive) {
                      mat.emissive.setHex(0x000000);
                      mat.emissiveIntensity = 0;
                    }
                  }
                }
              });
            }
          });
        }
      });
    } else {
      setPreviewPosition(null);
    }
  });

  if (!pasteMode || !copiedObjects || copiedObjects.length === 0 || !previewPosition) {
    return (
      <>
        {/* Invisible plane for raycasting */}
        <mesh
          ref={planeRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          visible={false}
        >
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </>
    );
  }

  // Calculate anchor grid position from preview position
  const anchorGrid = worldToGrid(previewPosition[0], previewPosition[2]);

  return (
    <>
      {/* Invisible plane for raycasting */}
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Preview all copied objects maintaining relative positions */}
      <group>
        {copiedObjects.map((copiedObj, index) => {
          const relativeWorldPos = gridToWorld(
            anchorGrid.gridX + copiedObj.relativeX,
            anchorGrid.gridZ + copiedObj.relativeZ
          );

          let PreviewComponent = null;
          if (copiedObj.type === 'wall') {
            PreviewComponent = (
              <Wall
                materials={activePalette}
                position={[relativeWorldPos.x, relativeWorldPos.y, relativeWorldPos.z]}
                rotation={copiedObj.rotation}
              />
            );
          } else if (copiedObj.type === 'corner') {
            PreviewComponent = (
              <Corner
                materials={activePalette}
                position={[relativeWorldPos.x, relativeWorldPos.y, relativeWorldPos.z]}
                rotation={copiedObj.rotation}
              />
            );
          } else if (copiedObj.type === 'tJunction') {
            PreviewComponent = (
              <TJunction
                materials={activePalette}
                position={[relativeWorldPos.x, relativeWorldPos.y, relativeWorldPos.z]}
                rotation={copiedObj.rotation}
              />
            );
          } else if (copiedObj.type === 'fourWayJunction') {
            PreviewComponent = (
              <FourWayJunction
                materials={activePalette}
                position={[relativeWorldPos.x, relativeWorldPos.y, relativeWorldPos.z]}
                rotation={copiedObj.rotation}
              />
            );
          } else if (copiedObj.type === 'desk') {
            PreviewComponent = (
              <Desk1
                materials={activePalette}
                position={[relativeWorldPos.x, relativeWorldPos.y, relativeWorldPos.z]}
                rotation={[0, copiedObj.rotation, 0]}
              />
            );
          } else if (copiedObj.type === 'turret') {
            PreviewComponent = (
              <Turret1
                materials={activePalette}
                position={[relativeWorldPos.x, relativeWorldPos.y, relativeWorldPos.z]}
                rotation={[0, copiedObj.rotation, 0]}
              />
            );
          }

          if (!PreviewComponent) return null;

          return (
            <group
              key={`paste-preview-${index}`}
              ref={(el) => {
                if (el) previewRefs.current.set(index, { current: el });
              }}
            >
              {PreviewComponent}
            </group>
          );
        })}
      </group>
    </>
  );
}

