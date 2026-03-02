import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import TowerDefenseEngine from './core/TowerDefenseEngine';

const dummy = new THREE.Object3D();

function EnemyInstances({ engine }) {
  const meshRef = useRef();

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    let index = 0;
    for (const enemy of engine.enemies) {
      if (!enemy.active) continue;
      dummy.position.copy(enemy.position);
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
    <instancedMesh ref={meshRef} args={[null, null, engine.maxEnemies]} castShadow>
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial color='#ef4444' roughness={0.55} metalness={0.1} />
    </instancedMesh>
  );
}

export default function TowerDefenseSandbox1() {
  const engine = useMemo(
    () =>
      new TowerDefenseEngine({
        gridSize: 25,
        cellSize: 2,
        maxEnemies: 20,
        waveSize: 20,
      }),
    []
  );

  const [wallVersion, setWallVersion] = useState(0);
  const wallMeshRef = useRef();

  useFrame((state, delta) => {
    engine.update(Math.min(delta, 1 / 24), state.clock.getElapsedTime());

    const mesh = wallMeshRef.current;
    if (!mesh) return;

    const walls = Array.from(engine.walls);
    walls.forEach((key, i) => {
      const [x, z] = key.split(',').map(Number);
      const world = engine.cellToWorld(x, z);
      dummy.position.set(world.x, 0.5, world.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.count = walls.length;
    mesh.instanceMatrix.needsUpdate = true;
  });

  const gridWorldSize = engine.gridSize * engine.cellSize;

  return (
    <>
      <color attach='background' args={['#87CEEB']} />
      <fog attach='fog' args={['#87CEEB', 40, 220]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight intensity={0.55} color='#ffffff' groundColor='#6b7280' />
      <directionalLight castShadow position={[16, 24, 10]} intensity={1.15} shadow-mapSize={[2048, 2048]} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={(event) => {
          event.stopPropagation();
          const { x, z } = event.point;
          const cell = engine.worldToCell(x, z);
          engine.toggleWall(cell.x, cell.z);
          setWallVersion((value) => value + 1);
        }}
      >
        <planeGeometry args={[gridWorldSize, gridWorldSize]} />
        <meshStandardMaterial color='#8B7355' roughness={0.92} metalness={0.05} />
      </mesh>

      <gridHelper key={wallVersion} args={[gridWorldSize, engine.gridSize, '#64748b', '#94a3b8']} position={[0, 0.01, 0]} />

      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.3, 0.7, 24]} />
        <meshStandardMaterial color='#22c55e' roughness={0.5} />
      </mesh>

      <instancedMesh
        ref={wallMeshRef}
        args={[null, null, engine.gridSize * engine.gridSize]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[engine.cellSize * 0.95, 1, engine.cellSize * 0.95]} />
        <meshStandardMaterial color='#334155' roughness={0.85} />
      </instancedMesh>

      <EnemyInstances engine={engine} />

      <OrbitControls makeDefault target={[0, 0, 0]} maxPolarAngle={Math.PI * 0.49} minDistance={14} maxDistance={80} />
    </>
  );
}
