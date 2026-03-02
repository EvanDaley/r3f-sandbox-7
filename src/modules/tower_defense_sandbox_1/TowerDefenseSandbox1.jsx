import { Html, OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import TowerDefenseEngine from './core/TowerDefenseEngine';

const dummy = new THREE.Object3D();

function EnemyTypeInstances({ engine, typeIndex }) {
  const meshRef = useRef();

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    let index = 0;
    for (const enemy of engine.enemies) {
      if (!enemy.active || enemy.typeIndex !== typeIndex) continue;

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

  const enemyType = engine.enemyTypes[typeIndex];

  return (
    <instancedMesh ref={meshRef} args={[null, null, engine.maxEnemies]} castShadow>
      <boxGeometry args={[enemyType.size, enemyType.size, enemyType.size]} />
      <meshStandardMaterial color={enemyType.color} roughness={0.55} metalness={0.1} />
    </instancedMesh>
  );
}

function EnemyInstances({ engine }) {
  return engine.enemyTypes.map((enemyType, typeIndex) => (
    <EnemyTypeInstances key={enemyType.id} engine={engine} typeIndex={typeIndex} />
  ));
}

function WallInstances({ engine, wallVersion }) {
  const meshRef = useRef();
  const wallKeys = useMemo(() => Array.from(engine.walls), [engine, wallVersion]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    wallKeys.forEach((key, i) => {
      const [x, z] = key.split(',').map(Number);
      const world = engine.cellToWorld(x, z);
      dummy.position.set(world.x, 0.5, world.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });

    mesh.count = wallKeys.length;
    mesh.instanceMatrix.needsUpdate = true;
  }, [engine, wallKeys]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, engine.gridSize * engine.gridSize]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[engine.cellSize * 0.95, 1, engine.cellSize * 0.95]} />
      <meshStandardMaterial color='#334155' roughness={0.85} />
    </instancedMesh>
  );
}

function SceneHud({ engine, wallVersion }) {
  const [stats, setStats] = useState({ activeEnemies: 0, pendingSpawns: 0, waveNumber: 0, amplifierCount: 0 });

  useFrame(() => {
    const activeEnemies = engine.enemies.reduce((count, enemy) => count + Number(enemy.active), 0);
    const pendingSpawns = engine.pendingSpawns.length;
    const waveNumber = engine.waveNumber;
    const amplifierCount = engine.activeAmplifierIds.length;
    setStats((prev) => {
      if (
        prev.activeEnemies === activeEnemies
        && prev.pendingSpawns === pendingSpawns
        && prev.waveNumber === waveNumber
        && prev.amplifierCount === amplifierCount
      ) return prev;

      return { activeEnemies, pendingSpawns, waveNumber, amplifierCount };
    });
  });

  return (
    <Html position={[-22, 8, -22]} transform={false}>
      <div
        style={{
          width: 310,
          borderRadius: 10,
          background: 'rgba(15, 23, 42, 0.82)',
          color: '#e2e8f0',
          padding: '12px 14px',
          fontFamily: 'ui-sans-serif, system-ui',
          fontSize: 13,
          lineHeight: 1.4,
          boxShadow: '0 6px 20px rgba(0,0,0,0.28)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Tower Defense Sandbox 1</div>
        <div>Click terrain to place/remove a wall.</div>
        <div>Press <b>N</b> to force a new wave.</div>
        <div>Press <b>K</b> to add a random skull amplifier.</div>
        <div>Home base target: (0, 0, 0)</div>
        <div style={{ marginTop: 8 }}>Wave: {stats.waveNumber}</div>
        <div>Active enemies: {stats.activeEnemies} / {engine.maxEnemies}</div>
        <div>Queued spawns: {stats.pendingSpawns}</div>
        <div>Amplifiers: {stats.amplifierCount}</div>
        <div>Walls: {engine.walls.size}</div>
        <div>Wall changes: {wallVersion}</div>

        <div style={{ marginTop: 8, fontWeight: 700 }}>Enemy Types</div>
        {engine.enemyTypes.map((type) => (
          <div key={type.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 99, background: type.color, display: 'inline-block' }} />
            <span>{type.label}</span>
            <span style={{ marginLeft: 'auto', opacity: 0.9 }}>SPD {type.baseSpeed.toFixed(1)} | HP {type.baseHealth}</span>
          </div>
        ))}

        <div style={{ marginTop: 8, fontWeight: 700 }}>Active Skulls</div>
        {engine.activeAmplifiers.length === 0 && <div style={{ opacity: 0.8 }}>None yet.</div>}
        {engine.activeAmplifiers.map((amp) => (
          <div key={amp.id}>☠ {amp.label}: {amp.description}</div>
        ))}
      </div>
    </Html>
  );
}

export default function TowerDefenseSandbox1() {
  const engine = useMemo(
    () => new TowerDefenseEngine({
      gridSize: 25,
      cellSize: 2,
      maxEnemies: 40,
      waveSize: 20,
    }),
    []
  );

  const [wallVersion, setWallVersion] = useState(0);
  const [, setRefreshTick] = useState(0);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === 'KeyK') {
        engine.forceAddAmplifier();
        setRefreshTick((v) => v + 1);
      }

      if (event.code === 'KeyN') {
        engine.forceNextWave(performance.now() / 1000);
        setRefreshTick((v) => v + 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [engine]);

  useFrame((state, delta) => {
    engine.update(Math.min(delta, 1 / 24), state.clock.getElapsedTime());
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

      <gridHelper args={[gridWorldSize, engine.gridSize, '#64748b', '#94a3b8']} position={[0, 0.01, 0]} />

      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.3, 0.7, 24]} />
        <meshStandardMaterial color='#22c55e' roughness={0.5} />
      </mesh>

      <WallInstances engine={engine} wallVersion={wallVersion} />
      <EnemyInstances engine={engine} />
      <SceneHud engine={engine} wallVersion={wallVersion} />

      <OrbitControls makeDefault target={[0, 0, 0]} maxPolarAngle={Math.PI * 0.49} minDistance={14} maxDistance={80} />
    </>
  );
}
