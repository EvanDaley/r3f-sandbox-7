import { KeyboardControls, Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RPG_KEYBOARD_MAP } from '../rpg/config/progressionConfig';
import Ecctrl from '../third_person_controller/Ecctrl';
import EnemyInstances2 from '../tower_defense_sandbox_1/components/EnemyInstances2';
import TowerDefenseEngine from '../tower_defense_sandbox_1/core/TowerDefenseEngine';
import useTowerDefenseUiStore from '../tower_defense_sandbox_1/stores/useTowerDefenseUiStore';

const dummy = new THREE.Object3D();
const SPAWN_POINT = new THREE.Vector3(0, 1.5, -2);
const WALL_STORAGE_KEY = 'dark-tower:walls';
const TURRET_STORAGE_KEY = 'dark-tower:turrets';

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
        <meshStandardMaterial color='#93c5fd' roughness={0.45} metalness={0.15} emissive='#1e293b' emissiveIntensity={0.45} />
      </mesh>
    </Ecctrl>
  );
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
      <meshStandardMaterial color='#111827' roughness={0.95} metalness={0.03} emissive='#020617' emissiveIntensity={0.2} />
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
        <meshStandardMaterial color='#1f2937' roughness={0.78} emissive='#0f172a' emissiveIntensity={0.2} />
      </instancedMesh>
      <instancedMesh ref={topRef} args={[null, null, engine.gridSize * engine.gridSize]} castShadow receiveShadow frustumCulled={false}>
        <coneGeometry args={[0.45, 0.8, 4]} />
        <meshStandardMaterial color='#a78bfa' roughness={0.35} metalness={0.2} emissive='#7c3aed' emissiveIntensity={0.55} />
      </instancedMesh>
    </>
  );
}

function GroundPlane({ engine, structureVersion }) {
  const materialRef = useRef();
  const smoothRef = useRef(new Float32Array(engine.gridSize * engine.gridSize));
  const targetRef = useRef(new Float32Array(engine.gridSize * engine.gridSize));

  const lightTexture = useMemo(() => {
    const data = new Uint8Array(engine.gridSize * engine.gridSize * 4);
    data.fill(0);
    const texture = new THREE.DataTexture(data, engine.gridSize, engine.gridSize, THREE.RGBAFormat);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
  }, [engine.gridSize]);

  useEffect(() => {
    const target = targetRef.current;
    target.fill(0);

    const lightFromCell = (cellX, cellZ, radius, value) => {
      for (let dz = -radius; dz <= radius; dz += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          const x = cellX + dx;
          const z = cellZ + dz;
          if (!engine.inBounds(x, z)) continue;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist > radius) continue;

          const falloff = 1 - dist / (radius + 0.001);
          const index = z * engine.gridSize + x;
          target[index] = Math.max(target[index], value * falloff);
        }
      }
    };

    lightFromCell(0, 0, 4, 1);

    engine.walls.forEach((key) => {
      const [x, z] = key.split(',').map(Number);
      lightFromCell(x, z, 2, 0.45);
    });

    engine.turrets.forEach((key) => {
      const [x, z] = key.split(',').map(Number);
      lightFromCell(x, z, 3, 0.8);
    });
  }, [engine, structureVersion]);

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    const speed = Math.min(delta * 3.5, 1);
    const data = lightTexture.image.data;
    const smooth = smoothRef.current;
    const target = targetRef.current;

    for (let i = 0; i < smooth.length; i += 1) {
      smooth[i] += (target[i] - smooth[i]) * speed;
      const px = i * 4;
      data[px] = Math.round(255 * THREE.MathUtils.clamp(smooth[i], 0, 1));
      data[px + 1] = data[px];
      data[px + 2] = data[px];
      data[px + 3] = 255;
    }

    lightTexture.needsUpdate = true;
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLightMap: { value: lightTexture },
      uGridSize: { value: engine.gridSize },
      uWorldSize: { value: engine.gridSize * engine.cellSize },
    }),
    [engine.cellSize, engine.gridSize, lightTexture]
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[engine.gridSize * engine.cellSize, engine.gridSize * engine.cellSize, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          varying vec3 vWorldPos;
          void main() {
            vUv = uv;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          varying vec3 vWorldPos;
          uniform float uTime;
          uniform sampler2D uLightMap;
          uniform float uGridSize;
          uniform float uWorldSize;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
          }

          float fbm(vec2 p) {
            float value = 0.0;
            float amp = 0.5;
            for (int i = 0; i < 4; i++) {
              value += amp * noise(p);
              p *= 2.05;
              amp *= 0.5;
            }
            return value;
          }

          void main() {
            vec2 worldUv = ((vWorldPos.xz / uWorldSize) + 0.5);
            float reveal = texture2D(uLightMap, worldUv).r;

            float dirt = fbm(vWorldPos.xz * 0.18 + vec2(0.0, uTime * 0.02));
            float stones = fbm(vWorldPos.xz * 0.55);
            float cracks = smoothstep(0.58, 0.82, fbm(vWorldPos.xz * 0.42 + 8.0));

            vec3 darkBase = vec3(0.02, 0.026, 0.035);
            vec3 litBase = vec3(0.18, 0.17, 0.15);
            vec3 color = mix(darkBase, litBase, reveal);
            color += vec3(dirt * 0.06 + stones * 0.03);
            color -= vec3(cracks * 0.08 * (1.0 - reveal * 0.6));

            float edgeFade = smoothstep(0.0, 0.08, worldUv.x) * smoothstep(0.0, 0.08, worldUv.y)
              * smoothstep(0.0, 0.08, 1.0 - worldUv.x) * smoothstep(0.0, 0.08, 1.0 - worldUv.y);
            color *= edgeFade;

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
}

function ExpansionLights({ engine, structureVersion, controllerRef }) {
  const dynamicKeys = useMemo(() => {
    const keys = ['0,0'];
    engine.turrets.forEach((key) => keys.push(key));
    engine.walls.forEach((key) => keys.push(key));
    return keys;
  }, [engine, structureVersion]);

  const playerPosition = controllerRef.current?.group?.translation?.() ?? SPAWN_POINT;

  const sortedKeys = useMemo(() => {
    const px = playerPosition.x;
    const pz = playerPosition.z;
    return dynamicKeys
      .map((key) => {
        const [x, z] = key.split(',').map(Number);
        const world = engine.cellToWorld(x, z);
        const distSq = (world.x - px) ** 2 + (world.z - pz) ** 2;
        return { key, world, distSq, isBase: key === '0,0' };
      })
      .sort((a, b) => {
        if (a.isBase) return -1;
        if (b.isBase) return 1;
        return a.distSq - b.distSq;
      })
      .slice(0, 8);
  }, [dynamicKeys, engine, playerPosition.x, playerPosition.z]);

  return (
    <>
      <ambientLight intensity={0.1} color='#0f172a' />
      <hemisphereLight intensity={0.08} color='#1e293b' groundColor='#020617' />
      <directionalLight castShadow position={[16, 28, 12]} intensity={0.35} color='#64748b' shadow-mapSize={[2048, 2048]} />
      {sortedKeys.map((entry) => (
        <pointLight
          key={entry.key}
          position={[entry.world.x, 1.25, entry.world.z]}
          intensity={entry.isBase ? 1.7 : 1.0}
          distance={entry.isBase ? 15 : 10}
          decay={2}
          color={entry.isBase ? '#fef3c7' : '#c4b5fd'}
          castShadow={entry.isBase}
        />
      ))}
    </>
  );
}

export default function DarkTower() {
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

    const rawWalls = window.localStorage.getItem(WALL_STORAGE_KEY);
    const rawTurrets = window.localStorage.getItem(TURRET_STORAGE_KEY);

    try {
      const wallKeys = rawWalls ? JSON.parse(rawWalls) : [];
      const turretKeys = rawTurrets ? JSON.parse(rawTurrets) : [];

      if (Array.isArray(wallKeys)) {
        engine.setWalls(wallKeys, false);
      }
      if (Array.isArray(turretKeys)) {
        engine.setTurrets(turretKeys, false);
      }
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
    const onForceWave = () => engine.forceNextWave(performance.now() / 1000);
    const onAddAmplifier = () => engine.forceAddAmplifier();

    window.addEventListener('td:force-wave', onForceWave);
    window.addEventListener('td:add-amplifier', onAddAmplifier);

    return () => {
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
      biomass: engine.biomass,
      energy: engine.energy,
      carbon: engine.carbon,
      uranium: engine.uranium,
      crystal: engine.crystal,
      amplifierCount: engine.activeAmplifierIds.length,
      activeAmplifiers: engine.activeAmplifiers,
      enemyTypes: engine.enemyTypes,
    });
  });

  const gridWorldSize = engine.gridSize * engine.cellSize;

  return (
    <>
      <color attach='background' args={['#000000']} />
      <fog attach='fog' args={['#02040a', 20, 130]} />
      <Stars radius={100} depth={60} count={1800} factor={4} fade speed={0.35} />
      <ExpansionLights engine={engine} structureVersion={structureVersion} controllerRef={controllerRef} />

      <Physics timeStep='vary'>
        <KeyboardControls map={RPG_KEYBOARD_MAP}>
          <PlayerCharacter controllerRef={controllerRef} />
        </KeyboardControls>

        <RigidBody type='fixed' colliders={false}>
          <CuboidCollider args={[gridWorldSize / 2, 0.1, gridWorldSize / 2]} position={[0, -0.1, 0]} />
        </RigidBody>

        <group
          onPointerDown={(event) => {
            if (event.button !== 2) return;
            event.stopPropagation();
            const cell = engine.worldToCell(event.point.x, event.point.z);

            if (buildSelection === 'turret') {
              engine.toggleTurret(cell.x, cell.z);
            } else {
              engine.toggleWall(cell.x, cell.z);
            }

            setStructureVersion((value) => value + 1);
          }}
          onContextMenu={(event) => {
            event.preventDefault();
          }}
        >
          <GroundPlane engine={engine} structureVersion={structureVersion} />
          <gridHelper args={[gridWorldSize, engine.gridSize, '#111827', '#1f2937']} position={[0, 0.02, 0]} />
        </group>

        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1, 1.3, 0.7, 24]} />
          <meshStandardMaterial color='#f59e0b' roughness={0.35} emissive='#f97316' emissiveIntensity={1.1} />
        </mesh>

        <WallInstances engine={engine} structureVersion={structureVersion} />
        <TurretInstances engine={engine} structureVersion={structureVersion} />
        <EnemyInstances2 engine={engine} />
      </Physics>
    </>
  );
}
