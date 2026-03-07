import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import Goblin2 from './Goblin2';

const dummy = new THREE.Object3D();

function AnimatedEnemy({ enemy, scene, size, animations }) {
  const groupRef = useRef();
  const mixerRef = useRef();
  const clonedScene = useMemo(() => scene ? scene.clone() : null, [scene]);
  
  // Calculate scale and Y offset
  const modelData = useMemo(() => {
    if (!clonedScene) return null;
    
    // Find the first mesh to compute bounding box
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
  
  // Set up animation for this instance
  useEffect(() => {
    if (!clonedScene || !animations || animations.length === 0) return;
    
    // Find the "Run" animation (exact match like in Goblin2)
    const runClip = animations.find((clip) => clip.name === 'Run');
    if (!runClip) return;
    
    // Create mixer and play animation (same pattern as Goblin2)
    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;
    
    const action = mixer.clipAction(runClip);
    action.reset().setLoop(THREE.LoopRepeat, Infinity).play();
    
    return () => {
      action.stop();
      mixer.uncacheClip(runClip);
    };
  }, [clonedScene, animations]);
  
  // Update position, rotation, and animation
  useFrame((state, delta) => {
    if (!groupRef.current || !modelData) return;
    
    // Hide if not active
    if (!enemy.active) {
      groupRef.current.visible = false;
      return;
    }
    
    groupRef.current.visible = true;
    
    // Update animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
    
    // Update position and rotation
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

function ModelEnemyInstances({ engine, typeIndex, modelPath, size }) {
  // Use Goblin2 component for goblin2.glb since we know it works
  if (modelPath === './models/organic/goblin2.glb') {
    return (
      <>
        {engine.enemies
          .filter((enemy) => enemy.typeIndex === typeIndex)
          .map((enemy) => (
            <Goblin2
              key={enemy.id}
              enemy={enemy}
              size={size}
            />
          ))}
      </>
    );
  }
  
  // Use AnimatedEnemy for other models
  const { scene, animations } = useGLTF(modelPath);
  
  if (!scene) return null;
  
  return (
    <>
      {engine.enemies
        .filter((enemy) => enemy.typeIndex === typeIndex)
        .map((enemy) => (
          <AnimatedEnemy
            key={enemy.id}
            enemy={enemy}
            scene={scene}
            size={size}
            animations={animations}
          />
        ))}
    </>
  );
}

function BoxEnemyInstances({ engine, typeIndex }) {
  const meshRef = useRef();
  const enemyType = engine.enemyTypes[typeIndex];

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    let index = 0;
    for (const enemy of engine.enemies) {
      if (!enemy.active || enemy.typeIndex !== typeIndex) continue;

      // Position box at ground level (half size up from center)
      dummy.position.set(
        enemy.position.x,
        enemyType.size * 0.5,
        enemy.position.z
      );
      dummy.rotation.y = Math.atan2(enemy.velocity.x, enemy.velocity.z);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      index += 1;
    }

    for (let i = index; i < engine.maxEnemies; i += 1) {
      dummy.position.set(0, -1000, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.count = engine.maxEnemies;
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, engine.maxEnemies]} castShadow frustumCulled={false}>
      <boxGeometry args={[enemyType.size, enemyType.size, enemyType.size]} />
      <meshStandardMaterial color={enemyType.color} roughness={0.55} metalness={0.1} />
    </instancedMesh>
  );
}

export default function EnemyInstances({ engine }) {
  return engine.enemyTypes.map((enemyType, typeIndex) => {
    if (enemyType.modelPath) {
      return (
        <ModelEnemyInstances 
          key={enemyType.id} 
          engine={engine} 
          typeIndex={typeIndex} 
          modelPath={enemyType.modelPath} 
          size={enemyType.size} 
        />
      );
    }
    return (
      <BoxEnemyInstances 
        key={enemyType.id} 
        engine={engine} 
        typeIndex={typeIndex} 
      />
    );
  });
}
