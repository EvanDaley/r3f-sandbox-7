import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * AnimatedCharacters Component
 * 
 * Loads animated-characters.glb and plays all animations on loop
 * Inspects the scene to find all animated objects and their animations
 */
export default function AnimatedCharacters() {
  const groupRef = useRef();
  const { scene, animations } = useGLTF("./models/third_person_blender_integrated/animated-characters.glb");
  const { actions, mixer } = useAnimations(animations, groupRef);

  // Inspect and play all animations
  useEffect(() => {
    if (!animations || animations.length === 0) {
      console.log("No animations found in animated-characters.glb");
      return;
    }

    console.log("Found animations:", animations.map(a => a.name));
    console.log("Total animations:", animations.length);

    // Log scene structure to understand object hierarchy
    const animatedObjects = [];
    scene.traverse((child) => {
      if (child.isSkinnedMesh || child.animations?.length > 0) {
        animatedObjects.push({
          name: child.name,
          type: child.type,
          animations: child.animations?.map(a => a.name) || [],
        });
      }
    });
    console.log("Animated objects in scene:", animatedObjects);

    // Prepare all animations first (don't play yet)
    const preparedActions = [];
    Object.keys(actions).forEach((name) => {
      const action = actions[name];
      if (action) {
        const clip = action.getClip();
        // Reset and configure animation
        action.reset();
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.time = 0;
        preparedActions.push({ action, name, duration: clip.duration });
        console.log(`Prepared animation: ${name} (duration: ${clip.duration.toFixed(2)}s)`);
      }
    });

    // Start all animations at the same time
    if (mixer) {
      mixer.time = 0;
    }
    
    preparedActions.forEach(({ action, name }) => {
      action.fadeIn(0.5).play();
    });

    // Cleanup on unmount
    return () => {
      Object.values(actions).forEach((action) => {
        if (action) {
          action.fadeOut(0.5);
        }
      });
    };
  }, [animations, actions, scene]);

  // Update animation mixer every frame
  useFrame((state, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
  });

  return <primitive ref={groupRef} object={scene} />;
}

// Preload the model
useGLTF.preload("./models/third_person_blender_integrated/animated-characters.glb");
