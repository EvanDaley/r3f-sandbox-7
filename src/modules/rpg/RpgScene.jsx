import { KeyboardControls } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import CharacterModel from '../third_person_blender_integrated/CharacterModel';
import Ecctrl from '../third_person_controller/Ecctrl';
import TrainingStation from './components/TrainingStation';
import { RPG_KEYBOARD_MAP, RPG_TRAINING_STATIONS } from './config/progressionConfig';
import useNearbyInteractables from './hooks/useNearbyInteractables';
import useRpgProgressionStore from './stores/useRpgProgressionStore';
import ProgressionSystem from './systems/ProgressionSystem';
import RemotePlayers from './components/RemotePlayers';
import { useNetworkedPlayerSync } from './hooks/useNetworkedPlayerSync';

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
      position={[0, 1.5, 0]}
      ref={controllerRef}
    >
      <CharacterModel />
    </Ecctrl>
  );
}

export default function RpgScene() {
  const controllerRef = useRef();
  const inputRef = useRef({ interact: false });
  const resetProgression = useRpgProgressionStore((state) => state.resetProgression);

  const trainingStations = useMemo(
    () => RPG_TRAINING_STATIONS.map((station) => ({ ...station, vector: new THREE.Vector3(...station.position) })),
    []
  );

  useNetworkedPlayerSync({ controllerRef });

  const nearbyInteractableIds = useNearbyInteractables({
    controllerRef,
    interactables: trainingStations,
  });

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === 'KeyE') {
        inputRef.current.interact = true;
      }

      if (event.code === 'KeyR') {
        resetProgression();
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
  }, [resetProgression]);

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
      <color attach='background' args={['#11131a']} />
      <fog attach='fog' args={['#11131a', 10, 35]} />
      <ambientLight intensity={0.45} />
      <directionalLight castShadow position={[8, 12, 6]} intensity={1.3} shadow-mapSize={[2048, 2048]} />

      <Physics timeStep='vary'>
        <KeyboardControls map={RPG_KEYBOARD_MAP}>
          <PlayerCharacter controllerRef={controllerRef} />
        </KeyboardControls>

        <RemotePlayers />

        <ProgressionSystem
          controllerRef={controllerRef}
          trainingStations={trainingStations}
          inputRef={inputRef}
          nearbyInteractableIds={nearbyInteractableIds}
        />

        <RigidBody type='fixed' colliders='cuboid' position={[0, -0.15, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[30, 0.3, 30]} />
            <meshStandardMaterial color='#202737' roughness={0.95} metalness={0.1} />
          </mesh>
        </RigidBody>

        {trainingStations.map((station) => (
          <TrainingStation
            key={station.id}
            station={station}
            showInteractPrompt={nearbyInteractableIds.has(station.id)}
          />
        ))}

        {/* <NetworkColorBox /> */}
      </Physics>
    </>
  );
}
