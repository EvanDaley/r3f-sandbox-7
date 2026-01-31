import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useSceneShadows } from "./hooks/useSceneShadows";
import { useAnimatePlatform } from "./hooks/useAnimatePlatform";

/**
 * BlenderScene Component
 * 
 * Loads a GLB scene from Blender and categorizes objects into three groups:
 * 1. simple_colliders - Default static objects with hull colliders (fixed)
 * 2. platforms - Moving platforms with hull colliders (kinematic)
 * 3. trimesh - Complex objects with trimesh colliders (reserved for future use)
 * 
 * Objects are categorized by name patterns:
 * - Objects starting with "platform_" go to platforms group
 * - Other objects go to simple_colliders by default
 * - trimesh group is reserved for future complex objects
 */
export default function BlenderScene({ 
  scenePath = "./models/third_person_blender_integrated/scene.glb"
}) {
  const { scene } = useGLTF(scenePath);

  // Categorize objects into three groups
  const { simpleCollidersGroup, platforms, trimeshGroup } = useMemo(() => {
    if (!scene) {
      return { simpleCollidersGroup: null, platforms: [], trimeshGroup: null };
    }

    // Clone the scene for categorization
    const clonedScene = scene.clone();
    const platforms = [];
    
    // Reserved for future use - complex objects that need trimesh colliders
    // const trimeshGroup = new THREE.Group();
    // trimeshGroup.name = "trimesh";
    const trimeshGroup = null;

    // Find and extract platform objects
    // Match names that contain "platform" (case-insensitive) - handles names like "platform_move_2.001"
    const platformPattern = /platform/i;
    const platformObjects = [];
    clonedScene.traverse((child) => {
      // Check if this is a platform object (name contains "platform", case-insensitive)
      if (child.name && platformPattern.test(child.name)) {
        platformObjects.push(child);
      }
    });
    
    // Assign phases evenly and create platform data
    platformObjects.forEach((child, index) => {
      // Distribute phases evenly across platforms (0-1, where 0 = start, 1 = end of cycle)
      const phase = platformObjects.length > 1 
        ? index / (platformObjects.length - 1) 
        : 0; // Evenly distribute from 0 to 1
      
      platforms.push({
        object: child.clone(),
        startPos: child.position.clone(),
        id: child.name || `platform-${index}`, // Unique identifier
        phase: phase, // Phase offset (0-1) to start at different positions in cycle
      });
      
      // Remove from cloned scene
      if (child.parent) {
        child.parent.remove(child);
      }
    });
    
    // Future: Add trimesh categorization logic here
    // clonedScene.traverse((child) => {
    //   if (child.name.startsWith("trimesh_")) {
    //     const cloned = child.clone();
    //     trimeshGroup.add(cloned);
    //     if (child.parent) {
    //       child.parent.remove(child);
    //     }
    //   }
    // });

    return {
      simpleCollidersGroup: clonedScene, // Remaining objects go to simple colliders
      platforms: platforms,
      trimeshGroup: trimeshGroup,
    };
  }, [scene]);

  // Set up shadow receiving for all groups
  useSceneShadows(scene);

  // Store RigidBody refs for platforms
  const platformRefsRef = useRef(new Map());

  // Animate platforms
  useAnimatePlatform(platforms, platformRefsRef, {
    moveDistance: 5,
    moveSpeed: 2,
  });

  return (
    <>
      {/* Simple colliders - default static objects with hull colliders */}
      {simpleCollidersGroup && (
        <RigidBody type="fixed" colliders="hull">
          <primitive object={simpleCollidersGroup} />
        </RigidBody>
      )}

      {/* Platforms - moving objects with hull colliders, kinematic */}
      {platforms.map((platformData, index) => {
        const platform = platformData.object;
        // Reset local position since RigidBody handles world position
        platform.position.set(0, 0, 0);
        
        // Calculate initial position based on phase offset
        const phase = platformData.phase || 0;
        const moveDistance = 5; // Should match the hook's moveDistance
        let initialOffsetX = 0;
        
        if (phase < 0.5) {
          // First half: moving forward from start
          initialOffsetX = (phase / 0.5) * moveDistance;
        } else {
          // Second half: moving backward from end
          initialOffsetX = moveDistance - ((phase - 0.5) / 0.5) * (moveDistance * 2);
        }
        
        return (
          <RigidBody
            key={`platform-${platform.name || index}`}
            type="kinematicPosition"
            colliders="hull"
            position={[
              platformData.startPos.x + initialOffsetX,
              platformData.startPos.y,
              platformData.startPos.z,
            ]}
            ref={(ref) => {
              if (ref) {
                platformRefsRef.current.set(platformData.id, ref);
              } else {
                platformRefsRef.current.delete(platformData.id);
              }
            }}
          >
            <primitive object={platform} />
          </RigidBody>
        );
      })}

      {/* Trimesh - reserved for future complex objects */}
      {/* {trimeshGroup && (
        <RigidBody type="fixed" colliders="trimesh">
          <primitive object={trimeshGroup} />
        </RigidBody>
      )} */}
    </>
  );
}

// Preload the scene
useGLTF.preload("./models/third_person_blender_integrated/scene.glb");
