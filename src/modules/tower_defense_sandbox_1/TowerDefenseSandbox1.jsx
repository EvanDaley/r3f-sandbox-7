import { KeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RPG_KEYBOARD_MAP } from '../rpg/config/progressionConfig';
import Ecctrl from '../third_person_controller/Ecctrl';
import TowerDefenseEngine from './core/TowerDefenseEngine';
import useTowerDefenseUiStore from './stores/useTowerDefenseUiStore';

const dummy = new THREE.Object3D();
const SPAWN_POINT = new THREE.Vector3(0, 1.5, 8);
const WALL_STORAGE_KEY = 'tower-defense-sandbox-1:walls';
const TURRET_STORAGE_KEY = 'tower-defense-sandbox-1:turrets';

function PlayerCharacter({ controllerRef }) {
  return (
    <Ecctrl
      springK={2}
      dampingC={0.2}
      camInitDis={-35}
      camMaxDis={-80}
      camCollisionOffset={0.3}
      camInitDir={{ x: 0.7, y: 0 }}
      camTargetPos={{ x: 0, y: 1.5, z: 0 }}
      position={SPAWN_POINT.toArray()}
      ref={controllerRef}
    >
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color='#60a5fa' roughness={0.5} metalness={0.1} />
      </mesh>
    </Ecctrl>
  );
}

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
    <instancedMesh ref={meshRef} args={[null, null, engine.maxEnemies]} castShadow frustumCulled={false}>
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

function WallInstances({ engine, structureVersion }) {
  const meshRef = useRef();
  const wallKeys = useMemo(() => Array.from(engine.walls), [engine, structureVersion]);

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
      frustumCulled={false}
    >
      <boxGeometry args={[engine.cellSize * 0.95, 1, engine.cellSize * 0.95]} />
      <meshStandardMaterial color='#334155' roughness={0.85} />
    </instancedMesh>
  );
}

function TurretInstances({ engine, structureVersion }) {
  const baseRef = useRef();
  const topRef = useRef();
  const turretKeys = useMemo(() => Array.from(engine.turrets), [engine, structureVersion]);

  useLayoutEffect(() => {
    const baseMesh = baseRef.current;
    const topMesh = topRef.current;
    if (!baseMesh || !topMesh) return;

    turretKeys.forEach((key, i) => {
      const [x, z] = key.split(',').map(Number);
      const world = engine.cellToWorld(x, z);

      dummy.position.set(world.x, 0.35, world.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      baseMesh.setMatrixAt(i, dummy.matrix);

      dummy.position.set(world.x, 0.95, world.z);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      topMesh.setMatrixAt(i, dummy.matrix);
    });

    baseMesh.count = turretKeys.length;
    topMesh.count = turretKeys.length;
    baseMesh.instanceMatrix.needsUpdate = true;
    topMesh.instanceMatrix.needsUpdate = true;
  }, [engine, turretKeys]);

  return (
    <>
      <instancedMesh ref={baseRef} args={[null, null, engine.gridSize * engine.gridSize]} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[engine.cellSize * 0.72, 0.7, engine.cellSize * 0.72]} />
        <meshStandardMaterial color='#374151' roughness={0.75} />
      </instancedMesh>
      <instancedMesh ref={topRef} args={[null, null, engine.gridSize * engine.gridSize]} castShadow receiveShadow frustumCulled={false}>
        <coneGeometry args={[0.45, 0.8, 4]} />
        <meshStandardMaterial color='#93c5fd' roughness={0.35} metalness={0.15} />
      </instancedMesh>
    </>
  );
}

function ProjectileInstances({ engine }) {
  const meshRef = useRef();

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const projectiles = engine.projectiles;
    for (let i = 0; i < projectiles.length; i += 1) {
      dummy.position.copy(projectiles[i].position);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    for (let i = projectiles.length; i < engine.maxEnemies * 2; i += 1) {
      dummy.position.set(0, -1000, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.count = engine.maxEnemies * 2;
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, engine.maxEnemies * 2]} castShadow frustumCulled={false}>
      <sphereGeometry args={[0.12, 8, 8]} />
      <meshStandardMaterial color='#fde047' emissive='#facc15' emissiveIntensity={0.7} />
    </instancedMesh>
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

  const setSnapshot = useTowerDefenseUiStore((state) => state.setSnapshot);
  const resetHud = useTowerDefenseUiStore((state) => state.reset);
  const buildSelection = useTowerDefenseUiStore((state) => state.buildSelection);

  const [structureVersion, setStructureVersion] = useState(0);
  const controllerRef = useRef();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawWalls = window.localStorage.getItem(WALL_STORAGE_KEY);
      const rawTurrets = window.localStorage.getItem(TURRET_STORAGE_KEY);
      const wallKeys = rawWalls ? JSON.parse(rawWalls) : [];
      const turretKeys = rawTurrets ? JSON.parse(rawTurrets) : [];

      if (Array.isArray(wallKeys)) {
        engine.setWalls(wallKeys);
      }
      if (Array.isArray(turretKeys)) {
        engine.setTurrets(turretKeys);
      }

      setStructureVersion((value) => value + 1);
    } catch {
      // Ignore malformed save data.
    }
  }, [engine]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(WALL_STORAGE_KEY, JSON.stringify(Array.from(engine.walls)));
    window.localStorage.setItem(TURRET_STORAGE_KEY, JSON.stringify(Array.from(engine.turrets)));
  }, [engine, structureVersion]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === 'KeyK') {
        engine.forceAddAmplifier();
      }

      if (event.code === 'KeyN') {
        engine.forceNextWave(performance.now() / 1000);
      }
    };

    const onForceWave = () => {
      engine.forceNextWave(performance.now() / 1000);
    };

    const onAddAmplifier = () => {
      engine.forceAddAmplifier();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('td:force-wave', onForceWave);
    window.addEventListener('td:add-amplifier', onAddAmplifier);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('td:force-wave', onForceWave);
      window.removeEventListener('td:add-amplifier', onAddAmplifier);
      resetHud();
    };
  }, [engine, resetHud]);

  useFrame((state, delta) => {
    engine.update(Math.min(delta, 1 / 24), state.clock.getElapsedTime());

    const rigidBody = controllerRef.current?.group;
    if (rigidBody && rigidBody.translation().y < -10) {
      rigidBody.setTranslation(SPAWN_POINT, true);
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }

    const activeEnemies = engine.enemies.reduce((count, enemy) => count + Number(enemy.active), 0);
    setSnapshot({
      waveNumber: engine.waveNumber,
      activeEnemies,
      maxEnemies: engine.maxEnemies,
      pendingSpawns: engine.pendingSpawns.length,
      wallCount: engine.walls.size,
      turretCount: engine.turrets.size,
      amplifierCount: engine.activeAmplifierIds.length,
      activeAmplifiers: engine.activeAmplifiers,
      enemyTypes: engine.enemyTypes,
    });
  });

  const gridWorldSize = engine.gridSize * engine.cellSize;

  return (
    <>
      <color attach='background' args={['#87CEEB']} />
      <fog attach='fog' args={['#87CEEB', 40, 220]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight intensity={0.55} color='#ffffff' groundColor='#6b7280' />
      <directionalLight castShadow position={[16, 24, 10]} intensity={1.15} shadow-mapSize={[2048, 2048]} />

      <Physics timeStep='vary'>
        <KeyboardControls map={RPG_KEYBOARD_MAP}>
          <PlayerCharacter controllerRef={controllerRef} />
        </KeyboardControls>

        <RigidBody type='fixed' colliders={false}>
          <CuboidCollider args={[gridWorldSize / 2, 0.1, gridWorldSize / 2]} position={[0, -0.1, 0]} />
        </RigidBody>

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
          onPointerDown={(event) => {
            if (event.button !== 2) return;
            event.stopPropagation();
            const { x, z } = event.point;
            const cell = engine.worldToCell(x, z);

            if (buildSelection === 'turret') {
              engine.toggleTurret(cell.x, cell.z);
            } else {
              engine.toggleWall(cell.x, cell.z);
            }

            setStructureVersion((value) => value + 1);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
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

        <WallInstances engine={engine} structureVersion={structureVersion} />
        <TurretInstances engine={engine} structureVersion={structureVersion} />
        <ProjectileInstances engine={engine} />
        <EnemyInstances engine={engine} />
      </Physics>
    </>
  );
}
