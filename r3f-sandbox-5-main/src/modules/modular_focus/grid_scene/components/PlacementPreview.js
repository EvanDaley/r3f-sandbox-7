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
 * PlacementPreview
 * 
 * Shows a semi-transparent preview of the object that will be placed
 * as the mouse moves around the scene.
 */
export default function PlacementPreview() {
  const planeRef = useRef();
  const previewRef = useRef();
  const { camera, mouse, raycaster } = useThree();
  const raycasterRef = useRef(new THREE.Raycaster());
  const selectedObjectType = useGridSceneStore((s) => s.selectedObjectType);
  const previewRotation = useGridSceneStore((s) => s.previewRotation);
  const overwrite = useGridSceneStore((s) => s.overwrite);
  const objects = useGridSceneStore((s) => s.objects);
  const activePalette = usePaletteStore((s) => s.activePalette);
  const [previewPosition, setPreviewPosition] = React.useState(null);
  const [isValidPosition, setIsValidPosition] = React.useState(false);
  const materialBackupsRef = useRef(new Map());

  // Cleanup: Reset materials when preview disappears
  useEffect(() => {
    if (!selectedObjectType || !previewPosition) {
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
  }, [selectedObjectType, previewPosition]);

  useFrame(() => {
    if (!selectedObjectType || !planeRef.current) {
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

      // Check if position is valid based on overwrite setting
      const objectAtPosition = Object.values(objects).find(
        (obj) => obj.gridX === gridX && obj.gridZ === gridZ
      );
      
      // Position is valid if it's empty OR overwrite is enabled
      const valid = !objectAtPosition || overwrite;
      
      setPreviewPosition([worldPos.x, worldPos.y, worldPos.z]);
      setIsValidPosition(valid);

      // Update preview materials for transparency (skip for desk and turret - they stay solid)
      if (previewRef.current && selectedObjectType !== 'desk' && selectedObjectType !== 'turret') {
        const opacity = valid ? 0.4 : 0.2;
        previewRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
              if (mat) {
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
    } else {
      setPreviewPosition(null);
    }
  });

  if (!selectedObjectType || !previewPosition) {
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

  // Render preview based on selected object type
  const previewOpacity = isValidPosition ? 0.4 : 0.2;

  let PreviewComponent = null;
  if (selectedObjectType === 'wall') {
    PreviewComponent = (
      <Wall
        materials={activePalette}
        position={previewPosition}
        rotation={previewRotation}
      />
    );
  } else if (selectedObjectType === 'corner') {
    PreviewComponent = (
      <Corner
        materials={activePalette}
        position={previewPosition}
        rotation={previewRotation}
      />
    );
  } else if (selectedObjectType === 'tJunction') {
    PreviewComponent = (
      <TJunction
        materials={activePalette}
        position={previewPosition}
        rotation={previewRotation}
      />
    );
  } else if (selectedObjectType === 'desk') {
    PreviewComponent = (
      <Desk1
        materials={activePalette}
        position={previewPosition}
        rotation={[0, previewRotation, 0]}
      />
    );
  } else if (selectedObjectType === 'turret') {
    PreviewComponent = (
      <Turret1
        materials={activePalette}
        position={previewPosition}
        rotation={[0, previewRotation, 0]}
      />
    );
  }

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

      {/* Preview object with transparency */}
      {/* Key forces remount when object type or rotation changes, preventing material sharing issues */}
      <group ref={previewRef} key={`preview-${selectedObjectType}-${previewRotation.toFixed(2)}`}>
        {PreviewComponent}
      </group>
    </>
  );
}

