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
 * Objects in Blender should be named with patterns:
 * - Static objects: No special naming needed (automatically get physics colliders)
 * - Moving platforms: "platform_move_*" (e.g., "platform_move_1", "platform_move_2")
 * - Rotating platforms: "platform_rotate_*" (e.g., "platform_rotate_1")
 * - Elevating platforms: "platform_elevate_*" (e.g., "platform_elevate_1")
 * 
 * The MovingPlatforms component will attach behavior (physics, animation) to platform objects.
 * 
 * This follows the same pattern as Slopes.jsx and RoughPlane.jsx - wrapping the entire
 * scene in a single RigidBody with trimesh colliders, which is simpler and more efficient
 * than creating individual RigidBodies for each mesh.
 */
export default function BlenderScene({ 
  scenePath = "./models/third_person_blender_integrated/scene.glb"
}) {
  const { scene } = useGLTF(scenePath);

  // Clone the scene and remove platform objects (they're handled by MovingPlatforms)
  const staticScene = useMemo(() => {
    const clone = scene.clone();
    
    // Remove platform objects from the cloned scene for physics
    // (they'll be handled separately by MovingPlatforms)
    clone.traverse((object) => {
      if (object.name && object.name.startsWith("platform_")) {
        // Remove from parent
        if (object.parent) {
          object.parent.remove(object);
        }
      }
    });
    
    return clone;
  }, [scene]);

  // Clone the full scene for visual rendering (includes platforms)
  const visualScene = useMemo(() => {
    return scene.clone();
  }, [scene]);

  // Set up shadow receiving for meshes
  useEffect(() => {
    visualScene.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.receiveShadow = true;
      }
    });
  }, [visualScene]);

  return (
    <>
      {/* Render the full visual scene (includes platforms) */}
      <primitive object={visualScene} />
      
      {/* Physics collider for static objects only (platforms excluded) */}
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={staticScene} />
      </RigidBody>
    </>
  );
}

// Preload the scene
useGLTF.preload("./models/third_person_blender_integrated/scene.glb");
