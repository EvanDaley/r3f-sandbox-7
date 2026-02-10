import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useSceneShadows } from "./hooks/useSceneShadows";
import { useAnimatePlatform } from "./hooks/useAnimatePlatform";
import { useAnimateVerticalPlatform } from "./hooks/useAnimateVerticalPlatform";
import TutorialGuy from "./TutorialGuy";

/**
 * BlenderScene Component
 * 
 * Loads a GLB scene and categorizes objects by name:
 * - "platform" -> moving horizontal platforms (hull colliders, kinematic)
 * - "zplatform" -> moving vertical platforms (hull colliders, kinematic)
 * - "static" -> trimesh colliders (fixed)
 * - everything else -> hull colliders (fixed)
 */
export default function BlenderScene({ 
  scenePath = "./models/third_person_blender_integrated/scene.glb"
}) {
  const { scene } = useGLTF(scenePath);

  // Categorize objects into groups
  const { staticGroup, platforms, verticalPlatforms, trimeshGroup, tutorialGuyPosition } = useMemo(() => {
    if (!scene) {
      return { staticGroup: null, platforms: [], verticalPlatforms: [], trimeshGroup: null, tutorialGuyPosition: null };
    }

    // Clone the entire scene once
    const clonedScene = scene.clone();
    const trimeshGroup = new THREE.Group();
    const platforms = [];
    const verticalPlatforms = [];
    let tutorialGuyPosition = null;
    
    const platformPattern = /platform/i;
    const zplatformPattern = /zplatform/i;
    const tutorialGuyPattern = /tutorial-guy-1|tutorialguy|tutorial_guy/i;
    const objectsToRemove = [];
    
    // Debug: log all object names to find tutorial-guy
    const allObjectNames = [];
    clonedScene.traverse((child) => {
      if (child.name) {
        allObjectNames.push(child.name);
      }
    });
    console.log("All object names in scene:", allObjectNames);
    
    // Find platforms, static objects, and tutorial-guy-1
    clonedScene.traverse((child) => {
      if (!child.name) return;
      
      if (zplatformPattern.test(child.name)) {
        const cloned = child.clone();
        verticalPlatforms.push({
          object: cloned,
          startPos: child.position.clone(),
          id: child.name,
        });
        objectsToRemove.push(child);
      } else if (platformPattern.test(child.name)) {
        const cloned = child.clone();
        platforms.push({
          object: cloned,
          startPos: child.position.clone(),
          id: child.name,
        });
        objectsToRemove.push(child);
      } else if (child.name === "static") {
        const cloned = child.clone();
        trimeshGroup.add(cloned);
        objectsToRemove.push(child);
      } else if (tutorialGuyPattern.test(child.name)) {
        // Extract position and remove from scene
        console.log("Found tutorial-guy object:", child.name, "at local position:", child.position);
        tutorialGuyPosition = new THREE.Vector3();
        // Get world position
        child.getWorldPosition(tutorialGuyPosition);
        console.log("World position:", tutorialGuyPosition);
        objectsToRemove.push(child);
      }
    });
    
    // Assign phases evenly to platforms
    platforms.forEach((platform, index) => {
      platform.phase = platforms.length > 1 ? index / (platforms.length - 1) : 0;
    });
    
    verticalPlatforms.forEach((platform, index) => {
      platform.phase = verticalPlatforms.length > 1 ? index / (verticalPlatforms.length - 1) : 0;
    });
    
    // Remove platforms and static from cloned scene
    objectsToRemove.forEach(obj => {
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    });

    return {
      staticGroup: clonedScene,
      platforms,
      verticalPlatforms,
      trimeshGroup: trimeshGroup.children.length > 0 ? trimeshGroup : null,
      tutorialGuyPosition,
    };
  }, [scene]);

  // Store RigidBody refs for platforms
  const platformRefsRef = useRef(new Map());
  const verticalPlatformRefsRef = useRef(new Map());

  // Animate platforms
  useAnimatePlatform(platforms, platformRefsRef, { moveDistance: 5, moveSpeed: 1 });
  useAnimateVerticalPlatform(verticalPlatforms, verticalPlatformRefsRef, { moveDistance: 5, moveSpeed: 1 });

  // Set up shadows
  useSceneShadows(scene);

  return (
    <>
      {/* Static objects with hull colliders */}
      {staticGroup && (
        <RigidBody type="fixed" colliders="hull">
          <primitive object={staticGroup} />
        </RigidBody>
      )}

      {/* Horizontal moving platforms */}
      {platforms.map((data, index) => {
        data.object.position.set(0, 0, 0);
        const phase = data.phase || 0;
        const moveDistance = 5;
        const initialOffsetX = phase < 0.5 
          ? (phase / 0.5) * moveDistance 
          : moveDistance - ((phase - 0.5) / 0.5) * (moveDistance * 2);
        
        return (
          <RigidBody
            key={data.id || `platform-${index}`}
            type="kinematicPosition"
            colliders="hull"
            position={[data.startPos.x + initialOffsetX, data.startPos.y, data.startPos.z]}
            ref={(ref) => {
              if (ref) platformRefsRef.current.set(data.id, ref);
              else platformRefsRef.current.delete(data.id);
            }}
          >
            <primitive object={data.object} />
          </RigidBody>
        );
      })}

      {/* Vertical moving platforms */}
      {verticalPlatforms.map((data, index) => {
        data.object.position.set(0, 0, 0);
        const phase = data.phase || 0;
        const moveDistance = 5;
        const initialOffsetY = phase < 0.5 
          ? (phase / 0.5) * moveDistance 
          : moveDistance - ((phase - 0.5) / 0.5) * (moveDistance * 2);
        
        return (
          <RigidBody
            key={data.id || `zplatform-${index}`}
            type="kinematicPosition"
            colliders="hull"
            position={[data.startPos.x, data.startPos.y + initialOffsetY, data.startPos.z]}
            ref={(ref) => {
              if (ref) verticalPlatformRefsRef.current.set(data.id, ref);
              else verticalPlatformRefsRef.current.delete(data.id);
            }}
          >
            <primitive object={data.object} />
          </RigidBody>
        );
      })}

      {/* Trimesh objects - Note: trimesh is more accurate but slower than hull.
          For better performance, consider using colliders="hull" if geometry is convex */}
      {trimeshGroup && (
        <RigidBody type="fixed" colliders="trimesh">
          <primitive object={trimeshGroup} />
        </RigidBody>
      )}

      {/* Tutorial Guy - replaces tutorial-guy-1 object from Blender scene */}
      {tutorialGuyPosition ? (
        <TutorialGuy position={[tutorialGuyPosition.x, tutorialGuyPosition.y, tutorialGuyPosition.z]} />
      ) : (
        // Fallback: render at origin if object not found (for debugging)
        <TutorialGuy position={[0, 5, 0]} />
      )}
    </>
  );
}

// Preload the scene
useGLTF.preload("./models/third_person_blender_integrated/scene.glb");
