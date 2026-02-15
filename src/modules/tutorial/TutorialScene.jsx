import { Html, KeyboardControls, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import CharacterModel from '../third_person_blender_integrated/CharacterModel';
import Ecctrl from '../third_person_controller/Ecctrl';
import { RPG_KEYBOARD_MAP } from '../rpg/config/progressionConfig';
import TrainingStation from '../rpg/components/TrainingStation';
import useNearbyInteractables from '../rpg/hooks/useNearbyInteractables';
import useSceneStore from '@/stores/sceneStore';

const EXIT_TARGET = new THREE.Vector3(0, 0, -31);

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
      camCollisionOffset={0.8}
      position={[0, 1.5, 8]}
      ref={controllerRef}
    >
      <CharacterModel />
    </Ecctrl>
  );
}

function TutorialMovingPlatforms() {
  const sideMovePlatformRef = useRef();
  const verticalMovePlatformRef = useRef();
  const rotatePlatformRef = useRef();
  const quaternionRotation = useMemo(() => new THREE.Quaternion(), []);
  const yRotationAxies = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    sideMovePlatformRef.current?.setNextKinematicTranslation({
      x: Math.sin(time * 0.8) * 2,
      y: 0.5,
      z: -8,
    });

    verticalMovePlatformRef.current?.setNextKinematicTranslation({
      x: 0,
      y: Math.sin(time * 0.9) * 1.4 + 2.2,
      z: -15,
    });

    rotatePlatformRef.current?.setNextKinematicTranslation({
      x: 0,
      y: 3.6,
      z: -22,
    });

    rotatePlatformRef.current?.setNextKinematicRotation(
      quaternionRotation.setFromAxisAngle(yRotationAxies, time * 0.8)
    );
  });

  return (
    <>
      <RigidBody type='kinematicPosition' ref={sideMovePlatformRef} colliders={false}>
        <CuboidCollider args={[2.2, 0.2, 2.2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.4, 0.4, 4.4]} />
          <meshStandardMaterial color='#f5d782' />
        </mesh>
      </RigidBody>

      <RigidBody type='kinematicPosition' ref={verticalMovePlatformRef} colliders={false}>
        <CuboidCollider args={[2.2, 0.2, 2.2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.4, 0.4, 4.4]} />
          <meshStandardMaterial color='#c8e6ff' />
        </mesh>
      </RigidBody>

      <RigidBody type='kinematicPosition' ref={rotatePlatformRef} colliders={false}>
        <CuboidCollider args={[2.2, 0.2, 2.2]} />
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.4, 0.4, 4.4]} />
          <meshStandardMaterial color='#f8b4d9' />
        </mesh>
      </RigidBody>
    </>
  );
}

function TutorialFlow({ controllerRef, nearbyInteractableIds, tutorialStations, inputRef, onInteraction }) {
  const setSceneId = useSceneStore((state) => state.setSceneId);
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

    if (!hasExited.current && playerPosition.distanceToSquared(EXIT_TARGET) <= 10) {
      hasExited.current = true;
      setSceneId('rpg');
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
          id: 'tutorialConsole',
          name: 'Mission Console',
          position: [-3.5, 0.75, 1.5],
          color: '#06d6a0',
        },
        {
          id: 'tutorialCrate',
          name: 'Supply Crate',
          position: [3.5, 0.75, -2.5],
          color: '#f4a261',
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
      <color attach='background' args={['#12171f']} />
      <fog attach='fog' args={['#12171f', 16, 46]} />
      <ambientLight intensity={0.5} />
      <directionalLight castShadow position={[8, 14, 4]} intensity={1.4} shadow-mapSize={[2048, 2048]} />

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
        />

        <RigidBody type='fixed' colliders='cuboid' position={[0, -0.2, -8]}>
          <mesh receiveShadow>
            <boxGeometry args={[18, 0.4, 48]} />
            <meshStandardMaterial color='#1d2530' roughness={0.92} metalness={0.08} />
          </mesh>
        </RigidBody>

        <RigidBody type='fixed' colliders='cuboid' position={[0, 0.45, -28]}>
          <mesh receiveShadow>
            <boxGeometry args={[10, 0.9, 8]} />
            <meshStandardMaterial color='#2b3342' roughness={0.86} metalness={0.15} />
          </mesh>
        </RigidBody>

        <TutorialMovingPlatforms />

        {tutorialStations.map((station) => (
          <TrainingStation
            key={station.id}
            station={station}
            showInteractPrompt={nearbyInteractableIds.has(station.id)}
          />
        ))}

        <mesh position={[0, 2.4, 7.4]}>
          <boxGeometry args={[12, 3.2, 0.2]} />
          <meshStandardMaterial color='#80ed99' emissive='#80ed99' emissiveIntensity={0.2} transparent opacity={0.22} />
        </mesh>

        <Text position={[0, 3.9, 7.1]} fontSize={0.48} color='#e2e8f0' anchorX='center'>
          Movement: WASD / Arrow Keys · Jump: Space · Sprint: Shift
        </Text>

        <Text position={[0, 3.1, 5.8]} fontSize={0.4} color='#a5b4fc' anchorX='center'>
          Camera: Hold Middle Mouse + Move Mouse
        </Text>

        <Text position={[0, 3.2, -6]} fontSize={0.5} color='#fef08a' anchorX='center'>
          Cross the moving platforms to continue
        </Text>

        <Text position={[0, 2.8, -28]} fontSize={0.55} color='#93c5fd' anchorX='center'>
          Exit Gate → Walk here to enter RPG World
        </Text>

        {lastInteractedLabel && (
          <Html position={[0, 4.8, 2.8]} center distanceFactor={10}>
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
