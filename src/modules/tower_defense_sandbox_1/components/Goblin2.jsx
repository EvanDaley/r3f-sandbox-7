import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

export default function Goblin2({ enemy, size = 1.15 }) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const { scene, animations } = useGLTF('./models/organic/goblin2.glb');
  const clonedScene = useMemo(() => scene ? scene.clone() : null, [scene]);
  
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
    
    const bottomOffset = bbox.min.y;
    const scale = size / modelSize;
    
    return {
      scale,
      yOffset: -bottomOffset * scale
    };
  }, [clonedScene, size]);
  
  // Set up animation
  useEffect(() => {
    if (!clonedScene || !animations || animations.length === 0) return;
    
    const runClip = animations.find((clip) => clip.name === 'Run');
    if (!runClip) return;
    
    // Clone the clip for this instance
    const clonedClip = runClip.clone();
    
    // Create mixer on the cloned scene
    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;
    
    const action = mixer.clipAction(clonedClip);
    action.reset().setLoop(THREE.LoopRepeat, Infinity).play();
    
    return () => {
      action.stop();
      mixer.uncacheClip(clonedClip);
    };
  }, [clonedScene, animations]);
  
  // Update position, rotation, and animation
  useFrame((state, delta) => {
    if (!groupRef.current || !modelData) return;
    
    if (!enemy.active) {
      groupRef.current.visible = false;
      return;
    }
    
    groupRef.current.visible = true;
    
    if (mixerRef.current) {
      mixerRef.current.update(delta);
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
