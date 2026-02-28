import { Html, KeyboardControls, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import CharacterModel from '../third_person_blender_integrated/CharacterModel';
import { RPG_KEYBOARD_MAP } from '../rpg/config/progressionConfig';
import TrainingStation from '../rpg/components/TrainingStation';
import useNearbyInteractables from '../rpg/hooks/useNearbyInteractables';
import Ecctrl from '../third_person_controller/Ecctrl';

const SPAWN_POINT = new THREE.Vector3(0, 1.5, 20);
const EXIT_TARGET = new THREE.Vector3(0, 0.8, -36);

function PlayerCharacter({ controllerRef }) {
  return (
    <Ecctrl
      animated
      springK={2}
      dampingC={0.2}
      autoBalanceSpringK={1.2}
      autoBalanceDampingC={0.04}
      autoBalanceSpringOnY={0.7}
      autoBalanceDampingOnY={0.05}
      camInitDis={-6}
      camMaxDis={-10}
      camCollisionOffset={0.3}
      camInitDir={{ x: -0.26, y: Math.PI }}
      camTargetPos={{ x: 0, y: 0.45, z: 0 }}
      position={SPAWN_POINT.toArray()}
      ref={controllerRef}
    >
      <Suspense
        fallback={
          <mesh castShadow>
            <capsuleGeometry args={[0.35, 0.8, 8, 16]} />
            <meshStandardMaterial color='#60a5fa' roughness={0.5} metalness={0.1} />
          </mesh>
        }
      >
        <CharacterModel />
      </Suspense>
    </Ecctrl>
  );
}

function RoomShell({ centerZ, title, instruction, color, doorToNext = true, doorToPrev = true }) {
  const roomWidth = 18;
  const roomLength = 14;
  const wallHeight = 2;
  const wallThickness = 0.5;
  const doorwayWidth = 4;
  const sideSegmentWidth = (roomWidth - doorwayWidth) / 2;

  const frontZ = centerZ - roomLength / 2;
  const backZ = centerZ + roomLength / 2;

  return (
    <group>
      <RigidBody type='fixed' colliders='cuboid' position={[0, -0.15, centerZ]}>
        <mesh receiveShadow>
          <boxGeometry args={[roomWidth, 0.3, roomLength]} />
          <meshStandardMaterial color='#0f3d5e' roughness={0.88} metalness={0.22} />
        </mesh>
      </RigidBody>

      <RigidBody type='fixed' colliders='cuboid' position={[roomWidth / 2, wallHeight / 2, centerZ]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[wallThickness, wallHeight, roomLength]} />
          <meshStandardMaterial color='#5b4ee6' roughness={0.65} metalness={0.26} />
        </mesh>
      </RigidBody>
      <RigidBody type='fixed' colliders='cuboid' position={[-roomWidth / 2, wallHeight / 2, centerZ]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[wallThickness, wallHeight, roomLength]} />
          <meshStandardMaterial color='#5b4ee6' roughness={0.65} metalness={0.26} />
        </mesh>
      </RigidBody>

      {!doorToPrev ? (
        <RigidBody type='fixed' colliders='cuboid' position={[0, wallHeight / 2, backZ]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[roomWidth, wallHeight, wallThickness]} />
              <meshStandardMaterial color='#5b4ee6' roughness={0.65} metalness={0.26} />
            </mesh>
          </RigidBody>
      ) : (
        <>
          <RigidBody type='fixed' colliders='cuboid' position={[-(doorwayWidth / 2 + sideSegmentWidth / 2), wallHeight / 2, backZ]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[sideSegmentWidth, wallHeight, wallThickness]} />
              <meshStandardMaterial color='#5b4ee6' roughness={0.65} metalness={0.26} />
            </mesh>
          </RigidBody>
          <RigidBody type='fixed' colliders='cuboid' position={[(doorwayWidth / 2 + sideSegmentWidth / 2), wallHeight / 2, backZ]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[sideSegmentWidth, wallHeight, wallThickness]} />
              <meshStandardMaterial color='#5b4ee6' roughness={0.65} metalness={0.26} />
            </mesh>
          </RigidBody>
        </>
      )}

      {!doorToNext ? (
        <RigidBody type='fixed' colliders='cuboid' position={[0, wallHeight / 2, frontZ]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[roomWidth, wallHeight, wallThickness]} />
              <meshStandardMaterial color='#5b4ee6' roughness={0.65} metalness={0.26} />
            </mesh>
          </RigidBody>
      ) : (
        <>
          <RigidBody type='fixed' colliders='cuboid' position={[-(doorwayWidth / 2 + sideSegmentWidth / 2), wallHeight / 2, frontZ]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[sideSegmentWidth, wallHeight, wallThickness]} />
              <meshStandardMaterial color='#5b4ee6' roughness={0.65} metalness={0.26} />
            </mesh>
          </RigidBody>
          <RigidBody type='fixed' colliders='cuboid' position={[(doorwayWidth / 2 + sideSegmentWidth / 2), wallHeight / 2, frontZ]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[sideSegmentWidth, wallHeight, wallThickness]} />
              <meshStandardMaterial color='#5b4ee6' roughness={0.65} metalness={0.26} />
            </mesh>
          </RigidBody>
        </>
      )}

      <pointLight position={[0, 3, centerZ]} intensity={14} distance={26} color={color} />
      <mesh position={[0, 3.75, centerZ]}>
        <boxGeometry args={[8, 0.2, 0.6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>

      <Text position={[0, 3.25, centerZ + 4]} fontSize={0.6} color='#e2e8f0' anchorX='center'>
        {title}
      </Text>
      <Text position={[0, 2.7, centerZ + 4]} fontSize={0.32} color='#bfdbfe' anchorX='center'>
        {instruction}
      </Text>
    </group>
  );
}

function TutorialMovingPlatforms() {
  const sideMovePlatformRef = useRef();
  const verticalMovePlatformRef = useRef();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    sideMovePlatformRef.current?.setNextKinematicTranslation({
      x: Math.sin(time * 0.9) * 2.8,
      y: 1.1,
      z: -19.5,
    });

    verticalMovePlatformRef.current?.setNextKinematicTranslation({
      x: 0,
      y: Math.sin(time * 1.2) * 1.2 + 2,
      z: -24,
    });
  });

  return (
    <>
      <RigidBody type='fixed' colliders='cuboid' position={[0, -2.6, -23]}>
        <mesh receiveShadow>
          <boxGeometry args={[18, 5, 12]} />
          <meshStandardMaterial color='#082f49' roughness={0.9} metalness={0.12} />
        </mesh>
      </RigidBody>

      <RigidBody type='kinematicPosition' ref={sideMovePlatformRef} colliders={false}>
        <CuboidCollider args={[2, 0.2, 2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 0.4, 4]} />
          <meshStandardMaterial color='#f5d782' />
        </mesh>
      </RigidBody>

      <RigidBody type='kinematicPosition' ref={verticalMovePlatformRef} colliders={false}>
        <CuboidCollider args={[2, 0.2, 2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 0.4, 4]} />
          <meshStandardMaterial color='#93c5fd' />
        </mesh>
      </RigidBody>

      <RigidBody type='fixed' colliders='cuboid' position={[0, 3.1, -28.5]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 0.4, 4]} />
          <meshStandardMaterial color='#86efac' roughness={0.7} />
        </mesh>
      </RigidBody>
    </>
  );
}

function TutorialFlow({ controllerRef, nearbyInteractableIds, tutorialStations, inputRef, onInteraction, onExitTutorial }) {
  const playerPosition = useMemo(() => new THREE.Vector3(), []);
  const lastInteractionAt = useRef(0);
  const hasExited = useRef(false);

  useFrame(() => {
    const rigidBody = controllerRef.current?.group;
    if (!rigidBody) {
      return;
    }

    const translation = rigidBody.translation();
    playerPosition.set(translation.x, translation.y, translation.z);

    if (translation.y < -8) {
      rigidBody.setTranslation(SPAWN_POINT, true);
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return;
    }

    if (!hasExited.current && playerPosition.distanceToSquared(EXIT_TARGET) <= 10) {
      hasExited.current = true;
      onExitTutorial();
      return;
    }

    const canInteract = inputRef.current.interact && performance.now() - lastInteractionAt.current > 600;
    if (!canInteract || nearbyInteractableIds.size === 0) {
      return;
    }

    let nearestStation = null;
    let nearestDistanceSquared = 5;

    for (let i = 0; i < tutorialStations.length; i += 1) {
      const station = tutorialStations[i];
      if (!nearbyInteractableIds.has(station.id)) {
        continue;
      }

      const distanceSquared = playerPosition.distanceToSquared(station.vector);
      if (distanceSquared <= nearestDistanceSquared) {
        nearestDistanceSquared = distanceSquared;
        nearestStation = station;
      }
    }

    if (!nearestStation) {
      return;
    }

    lastInteractionAt.current = performance.now();
    onInteraction(nearestStation.name);
  });

  return null;
}

export default function TutorialScene() {
  const controllerRef = useRef();
  const inputRef = useRef({ interact: false });
  const [lastInteractedLabel, setLastInteractedLabel] = useState('');

  const tutorialStations = useMemo(
    () =>
      [
        {
          id: 'movementBeacon',
          name: 'Movement Beacon',
          position: [-4, 0.75, 20],
          color: '#06d6a0',
        },
        {
          id: 'cameraBeacon',
          name: 'Camera Beacon',
          position: [4, 0.75, 4],
          color: '#f4a261',
        },
        {
          id: 'jumpBeacon',
          name: 'Jump Beacon',
          position: [-3, 0.75, -12],
          color: '#a78bfa',
        },
      ].map((station) => ({ ...station, vector: new THREE.Vector3(...station.position) })),
    []
  );

  const nearbyInteractableIds = useNearbyInteractables({
    controllerRef,
    interactables: tutorialStations,
  });

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === 'KeyE') {
        inputRef.current.interact = true;
      }
    };

    const onKeyUp = (event) => {
      if (event.code === 'KeyE') {
        inputRef.current.interact = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.__RPG_SMOKE_TEST__ = {
      getPlayerPosition: () => {
        const body = controllerRef.current?.group;
        if (!body) return null;

        const translation = body.translation();
        return {
          x: translation.x,
          y: translation.y,
          z: translation.z,
        };
      },
    };

    return () => {
      delete window.__RPG_SMOKE_TEST__;
    };
  }, []);

  return (
    <>
      <color attach='background' args={['#171a4a']} />
      <fog attach='fog' args={['#0f1232', 18, 72]} />
      <ambientLight intensity={0.54} color='#dbeafe' />
      <hemisphereLight intensity={0.8} color='#fdf4ff' groundColor='#1e3a8a' />
      <directionalLight castShadow position={[10, 15, 12]} intensity={1.7} color='#bfdbfe' shadow-mapSize={[2048, 2048]} />

      <Physics timeStep='vary'>
        <KeyboardControls map={RPG_KEYBOARD_MAP}>
          <PlayerCharacter controllerRef={controllerRef} />
        </KeyboardControls>

        <TutorialFlow
          controllerRef={controllerRef}
          nearbyInteractableIds={nearbyInteractableIds}
          tutorialStations={tutorialStations}
          inputRef={inputRef}
          onInteraction={(label) => setLastInteractedLabel(label)}
          onExitTutorial={() => {
            window.dispatchEvent(new CustomEvent('scene:go-rpg'));
          }}
        />

        <RoomShell
          centerZ={20}
          title='Room 1 · Movement'
          instruction='Use WASD or Arrow Keys to move. Hold Shift to sprint.'
          color='#22d3ee'
        />

        <RigidBody type='fixed' colliders='cuboid' position={[0, -0.15, 12]}>
          <mesh receiveShadow>
            <boxGeometry args={[10, 0.3, 2]} />
            <meshStandardMaterial color='#0f3d5e' roughness={0.88} metalness={0.22} />
          </mesh>
        </RigidBody>
        <RoomShell
          centerZ={4}
          title='Room 2 · Camera'
          instruction='Hold middle mouse and move the mouse to orbit the camera.'
          color='#f59e0b'
        />

        <RigidBody type='fixed' colliders='cuboid' position={[0, -0.15, -4]}>
          <mesh receiveShadow>
            <boxGeometry args={[10, 0.3, 2]} />
            <meshStandardMaterial color='#0f3d5e' roughness={0.88} metalness={0.22} />
          </mesh>
        </RigidBody>
        <RoomShell
          centerZ={-12}
          title='Room 3 · Jumping'
          instruction='Press Space to jump and cross the moving platform path.'
          color='#22c55e'
          doorToNext={false}
        />

        <TutorialMovingPlatforms />

        <RigidBody type='fixed' colliders='cuboid' position={[0, 0.3, -36]}>
          <mesh receiveShadow>
            <boxGeometry args={[12, 0.6, 10]} />
            <meshStandardMaterial color='#1f2a3f' roughness={0.8} metalness={0.14} />
          </mesh>
        </RigidBody>

        <mesh position={[0, 2.5, -32.5]}>
          <torusGeometry args={[2.3, 0.2, 18, 46]} />
          <meshStandardMaterial color='#7dd3fc' emissive='#7dd3fc' emissiveIntensity={0.75} toneMapped={false} />
        </mesh>

        <Text position={[0, 3.1, -35.5]} fontSize={0.5} color='#e0f2fe' anchorX='center'>
          Final Gate · Walk into the lit area to enter RPG World
        </Text>

        {tutorialStations.map((station) => (
          <TrainingStation
            key={station.id}
            station={station}
            showInteractPrompt={nearbyInteractableIds.has(station.id)}
          />
        ))}

        {lastInteractedLabel && (
          <Html position={[0, 5, 18]} center distanceFactor={10}>
            <div
              style={{
                color: '#f8fafc',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(15, 23, 42, 0.88)',
                padding: '8px 12px',
                whiteSpace: 'nowrap',
              }}
            >
              {`Nice! You interacted with ${lastInteractedLabel}.`}
            </div>
          </Html>
        )}
      </Physics>
    </>
  );
}
