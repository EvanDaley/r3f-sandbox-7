import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

function AnimatedGoblin({ enemy, scene, animations, size }) {
  const groupRef = useRef();
  const mixerRef = useRef();
  // Clone scene fresh for each instance - ensure each enemy gets its own unique clone
  const clonedScene = useMemo(() => {
    if (!scene) return null;
    // Use clone from SkeletonUtils to properly clone skeletons for animations
    // This creates a deep clone with proper skeleton references
    const cloned = clone(scene);
    // Ensure unique UUID to prevent any sharing issues
    cloned.uuid = THREE.MathUtils.generateUUID();
    cloned.traverse((child) => {
      if (child.uuid) {
        child.uuid = THREE.MathUtils.generateUUID();
      }
    });
    return cloned;
  }, [scene, enemy.id]); // Include enemy.id to force new clone per enemy
  
  // Calculate scale and Y offset
  const modelData = useMemo(() => {
    if (!clonedScene) return null;
    
    let firstMesh = null;
    clonedScene.traverse((child) => {
      if (child.isMesh && !firstMesh) {
        firstMesh = child;
      }
    });
    
    if (!firstMesh) return null;
    
    firstMesh.geometry.computeBoundingBox();
    const bbox = firstMesh.geometry.boundingBox;
    const modelSize = Math.max(
      bbox.max.x - bbox.min.x,
      bbox.max.y - bbox.min.y,
      bbox.max.z - bbox.min.z
    );
    
    const scale = size / modelSize;
    const yOffset = -bbox.min.y * scale;
    
    return { scale, yOffset };
  }, [clonedScene, size]);
  
  // Set up animation
  useEffect(() => {
    if (!clonedScene || !animations || animations.length === 0) {
      console.warn('AnimatedGoblin: Missing scene or animations', { hasScene: !!clonedScene, animCount: animations?.length });
      return;
    }
    
    const runClip = animations.find((clip) => clip.name === 'Run');
    if (!runClip) {
      console.warn('AnimatedGoblin: Run animation not found. Available:', animations.map(a => a.name));
      return;
    }
    
    // Clone the clip for this instance
    const clonedClip = runClip.clone();
    
    // Create mixer on the cloned scene
    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;
    
    const action = mixer.clipAction(clonedClip);
    if (!action) {
      console.warn('AnimatedGoblin: Failed to create clipAction');
      return;
    }
    
    action.reset().setLoop(THREE.LoopRepeat, Infinity).play();
    
    // Debug: Check if action is actually playing
    console.log('AnimatedGoblin: Animation setup', {
      clipName: clonedClip.name,
      actionEnabled: action.enabled,
      actionPaused: action.paused,
      actionTime: action.time,
      mixerTime: mixer.time
    });
    
    return () => {
      action.stop();
      mixer.uncacheClip(clonedClip);
    };
  }, [clonedScene, animations]);
  
  // Update animation and position
  useFrame((state, delta) => {
    if (!groupRef.current || !modelData) return;
    
    if (!enemy.active) {
      groupRef.current.visible = false;
      return;
    }
    
    groupRef.current.visible = true;
    
    if (mixerRef.current) {
      mixerRef.current.update(delta);
      // Debug: Log mixer time occasionally
      if (Math.random() < 0.01) {
        console.log('AnimatedGoblin: Mixer updating', {
          mixerTime: mixerRef.current.time,
          delta
        });
      }
    }
    
    groupRef.current.position.set(
      enemy.position.x,
      modelData.yOffset,
      enemy.position.z
    );
    groupRef.current.rotation.y = Math.atan2(enemy.velocity.x, enemy.velocity.z);
    groupRef.current.scale.set(modelData.scale, modelData.scale, modelData.scale);
  });
  
  if (!clonedScene || !modelData) return null;
  
  return <primitive ref={groupRef} object={clonedScene} castShadow />;
}

export default function EnemyInstances2({ engine }) {
  // Load all models once at the parent level
  const goblin1 = useGLTF('./models/organic/goblin1.glb');
  const goblin2 = useGLTF('./models/organic/goblin2.glb');
  const goblin3 = useGLTF('./models/organic/goblin3.glb');
  const goblin4 = useGLTF('./models/organic/goblin4.glb');
  
  // Map model paths to loaded data
  const modelData = useMemo(() => {
    return {
      './models/organic/goblin1.glb': goblin1,
      './models/organic/goblin2.glb': goblin2,
      './models/organic/goblin3.glb': goblin3,
      './models/organic/goblin4.glb': goblin4,
    };
  }, [goblin1, goblin2, goblin3, goblin4]);
  
  return (
    <>
      {engine.enemies.map((enemy) => {
        const enemyType = engine.enemyTypes[enemy.typeIndex];
        if (!enemyType.modelPath) return null;
        
        const loaded = modelData[enemyType.modelPath];
        if (!loaded || !loaded.scene) return null;
        
        // Always render, let AnimatedGoblin handle visibility
        return (
          <AnimatedGoblin
            key={enemy.id}
            enemy={enemy}
            scene={loaded.scene}
            animations={loaded.animations}
            size={enemyType.size}
          />
        );
      })}
    </>
  );
}
