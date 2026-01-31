import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useMemo, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
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
  const platformRef = useRef(null);
  const startPosRef = useRef(null);
  const directionRef = useRef(1);
  const moveDistance = useRef(5); // Distance to move in each direction
  const moveSpeed = useRef(2); // Speed of movement

  // Find and set up the moving platform
  useEffect(() => {
    if (!scene) return;
    
    scene.traverse((child) => {
      // Set up shadow receiving for meshes
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        child.receiveShadow = true;
      }

      // Find the platform_move_2 object
      if (child.name === "platform_move_2") {
        platformRef.current = child;
        // Store the initial position
        startPosRef.current = child.position.clone();
      }
    });
  }, [scene]);

  // Animate the moving platform
  useFrame((state, delta) => {
    if (!platformRef.current || !startPosRef.current) return;

    const platform = platformRef.current;
    const startPos = startPosRef.current;
    const direction = directionRef.current;

    // Move the platform
    platform.position.x += moveSpeed.current * delta * direction;

    // Check if we've reached the limits and reverse direction
    const distanceFromStart = platform.position.x - startPos.x;
    if (distanceFromStart >= moveDistance.current) {
      directionRef.current = -1;
    } else if (distanceFromStart <= -moveDistance.current) {
      directionRef.current = 1;
    }
  });

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <primitive object={scene} />
    </RigidBody>
  );
}

// Preload the scene
useGLTF.preload("./models/third_person_blender_integrated/scene.glb");
