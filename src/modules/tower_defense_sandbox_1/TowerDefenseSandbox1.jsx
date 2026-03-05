import { useFrame, useThree } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import TowerDefenseEngine from './core/TowerDefenseEngine';
import useTowerDefenseUiStore from './stores/useTowerDefenseUiStore';

const dummy = new THREE.Object3D();
const WALL_STORAGE_KEY = 'tower-defense-sandbox-1:walls';
const TURRET_STORAGE_KEY = 'tower-defense-sandbox-1:turrets';

const RTS_CAMERA_DEFAULTS = {
  target: new THREE.Vector3(0, 0, 0),
  yaw: Math.PI / 4,
  pitch: THREE.MathUtils.degToRad(54),
  distance: 56,
  moveSpeed: 32,
  rotateSpeed: 2.2,
  zoomSpeed: 1.4,
  minDistance: 28,
  maxDistance: 95,
  edgeThresholdPx: 28,
  edgePanSpeed: 1,
  minPitch: THREE.MathUtils.degToRad(40),
  maxPitch: THREE.MathUtils.degToRad(68),
};

function StarcraftCameraController({ mapHalfSize }) {
  const { camera, gl, size } = useThree();
  const stateRef = useRef({
    pressedKeys: new Set(),
    mousePosition: { x: size.width / 2, y: size.height / 2 },
    middleMouseDown: false,
  });

  const spherical = useMemo(
    () => new THREE.Spherical(RTS_CAMERA_DEFAULTS.distance, RTS_CAMERA_DEFAULTS.pitch, RTS_CAMERA_DEFAULTS.yaw),
    []
  );

  const target = useMemo(() => RTS_CAMERA_DEFAULTS.target.clone(), []);
  const cameraOffset = useMemo(() => new THREE.Vector3(), []);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.fov = 45;
    camera.near = 0.1;
    camera.far = 1400;
    camera.updateProjectionMatrix();
  }, [camera]);

  useEffect(() => {
    const dom = gl.domElement;

    const onContextMenu = (event) => event.preventDefault();
    const onKeyDown = (event) => stateRef.current.pressedKeys.add(event.code);
    const onKeyUp = (event) => stateRef.current.pressedKeys.delete(event.code);

    const onMouseDown = (event) => {
      if (event.button === 1) {
        stateRef.current.middleMouseDown = true;
      }
    };

    const onMouseUp = (event) => {
      if (event.button === 1) {
        stateRef.current.middleMouseDown = false;
      }
    };

    const onMouseMove = (event) => {
      const rect = dom.getBoundingClientRect();
      stateRef.current.mousePosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      if (!stateRef.current.middleMouseDown) return;

      spherical.theta -= event.movementX * 0.004;
      spherical.phi = THREE.MathUtils.clamp(
        spherical.phi + event.movementY * 0.003,
        RTS_CAMERA_DEFAULTS.minPitch,
        RTS_CAMERA_DEFAULTS.maxPitch
      );
    };

    const onWheel = (event) => {
      event.preventDefault();
      const zoomDelta = event.deltaY * 0.01 * RTS_CAMERA_DEFAULTS.zoomSpeed;
      spherical.radius = THREE.MathUtils.clamp(
        spherical.radius + zoomDelta,
        RTS_CAMERA_DEFAULTS.minDistance,
        RTS_CAMERA_DEFAULTS.maxDistance
      );
    };

    dom.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('mousemove', onMouseMove);
    dom.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      dom.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('mousemove', onMouseMove);
      dom.removeEventListener('wheel', onWheel);
    };
  }, [gl, spherical]);

  useFrame((_, delta) => {
    const { pressedKeys, mousePosition } = stateRef.current;
    const moveVector = new THREE.Vector3();

    forward.set(Math.sin(spherical.theta), 0, Math.cos(spherical.theta)).normalize();
    right.set(forward.z, 0, -forward.x).normalize();

    if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp')) moveVector.add(forward);
    if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown')) moveVector.sub(forward);
    if (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight')) moveVector.add(right);
    if (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft')) moveVector.sub(right);

    if (pressedKeys.has('KeyQ')) spherical.theta += RTS_CAMERA_DEFAULTS.rotateSpeed * delta;
    if (pressedKeys.has('KeyE')) spherical.theta -= RTS_CAMERA_DEFAULTS.rotateSpeed * delta;

    const nearLeftEdge = mousePosition.x <= RTS_CAMERA_DEFAULTS.edgeThresholdPx;
    const nearRightEdge = mousePosition.x >= size.width - RTS_CAMERA_DEFAULTS.edgeThresholdPx;
    const nearTopEdge = mousePosition.y <= RTS_CAMERA_DEFAULTS.edgeThresholdPx;
    const nearBottomEdge = mousePosition.y >= size.height - RTS_CAMERA_DEFAULTS.edgeThresholdPx;

    if (nearTopEdge) moveVector.add(forward.clone().multiplyScalar(RTS_CAMERA_DEFAULTS.edgePanSpeed));
    if (nearBottomEdge) moveVector.sub(forward.clone().multiplyScalar(RTS_CAMERA_DEFAULTS.edgePanSpeed));
    if (nearRightEdge) moveVector.add(right.clone().multiplyScalar(RTS_CAMERA_DEFAULTS.edgePanSpeed));
    if (nearLeftEdge) moveVector.sub(right.clone().multiplyScalar(RTS_CAMERA_DEFAULTS.edgePanSpeed));

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize().multiplyScalar(RTS_CAMERA_DEFAULTS.moveSpeed * delta * (spherical.radius / 40));
      target.add(moveVector);
      target.x = THREE.MathUtils.clamp(target.x, -mapHalfSize, mapHalfSize);
      target.z = THREE.MathUtils.clamp(target.z, -mapHalfSize, mapHalfSize);
    }

    cameraOffset.setFromSpherical(spherical);
    camera.position.copy(target).add(cameraOffset);
    camera.lookAt(target);
  });

  return null;
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
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const rawWalls = window.localStorage.getItem(WALL_STORAGE_KEY);
      const rawTurrets = window.localStorage.getItem(TURRET_STORAGE_KEY);
      const wallKeys = rawWalls ? JSON.parse(rawWalls) : [];
      const turretKeys = rawTurrets ? JSON.parse(rawTurrets) : [];

      // Set walls and turrets without rebuilding flow field each time
      if (Array.isArray(wallKeys)) {
        engine.setWalls(wallKeys, false);
      }
      if (Array.isArray(turretKeys)) {
        engine.setTurrets(turretKeys, false);
      }
      
      // Rebuild flow field once after both are set
      engine.rebuildFlowField();

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

    const onClearAll = () => {
      engine.clearAllStructures();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(WALL_STORAGE_KEY);
        window.localStorage.removeItem(TURRET_STORAGE_KEY);
      }
      setStructureVersion((value) => value + 1);
    };

    const onClearTurrets = () => {
      engine.clearTurrets();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(TURRET_STORAGE_KEY);
      }
      setStructureVersion((value) => value + 1);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('td:force-wave', onForceWave);
    window.addEventListener('td:add-amplifier', onAddAmplifier);
    window.addEventListener('td:clear-all', onClearAll);
    window.addEventListener('td:clear-turrets', onClearTurrets);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('td:force-wave', onForceWave);
      window.removeEventListener('td:add-amplifier', onAddAmplifier);
      window.removeEventListener('td:clear-all', onClearAll);
      window.removeEventListener('td:clear-turrets', onClearTurrets);
      resetHud();
    };
  }, [engine, resetHud]);

  useFrame((state, delta) => {
    engine.update(Math.min(delta, 1 / 24), state.clock.getElapsedTime());

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
      <StarcraftCameraController mapHalfSize={gridWorldSize / 2 - engine.cellSize} />

      <color attach='background' args={['#87CEEB']} />
      <fog attach='fog' args={['#87CEEB', 40, 220]} />
      <ambientLight intensity={0.45} />
      <hemisphereLight intensity={0.55} color='#ffffff' groundColor='#6b7280' />
      <directionalLight castShadow position={[16, 24, 10]} intensity={1.15} shadow-mapSize={[2048, 2048]} />

      <Physics timeStep='vary'>
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
