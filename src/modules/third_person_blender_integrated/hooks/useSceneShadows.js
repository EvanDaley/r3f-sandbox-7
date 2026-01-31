import { useEffect } from "react";
import * as THREE from "three";

/**
 * Hook to set up shadow receiving for meshes in a scene
 * @param {THREE.Object3D} scene - The scene to configure shadows for
 */
export function useSceneShadows(scene) {
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.receiveShadow = true;
      }
    });
  }, [scene]);
}
