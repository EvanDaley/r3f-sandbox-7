import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useMemo, useEffect } from "react";
import * as THREE from "three";

/**
 * BlenderScene Component
 * 
 * Loads a GLB scene from Blender and renders everything with physics colliders.
 * Blender controls: position, scale, and how many objects exist.
 * 
 * This follows the same pattern as Slopes.jsx and RoughPlane.jsx - wrapping the entire
 * scene in a single RigidBody with trimesh colliders, which is simpler and more efficient
 * than creating individual RigidBodies for each mesh.
 */
export default function BlenderScene({ 
  scenePath = "./models/third_person_blender_integrated/scene.glb"
}) {
  const { scene } = useGLTF(scenePath);

  // Set up shadow receiving for meshes
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

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={scene} />
    </RigidBody>
  );
}

// Preload the scene
useGLTF.preload("./models/third_person_blender_integrated/scene.glb");
