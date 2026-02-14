import { KeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import CharacterModel from "../third_person_blender_integrated/CharacterModel";
import Ecctrl from "../third_person_controller/Ecctrl";
import ProgressionHud from "./components/ProgressionHud";
import useRpgProgressionStore from "./stores/useRpgProgressionStore";

const TRAINING_STATIONS = [
  { id: "woodcuttingTree", skillId: "woodcutting", name: "Ancient Tree", xp: 22, position: [-5, 0.75, -2], color: "#8d6e63" },
  { id: "miningRock", skillId: "mining", name: "Ore Vein", xp: 20, position: [4, 0.8, -4], color: "#90a4ae" },
  { id: "craftingBench", skillId: "crafting", name: "Crafting Bench", xp: 24, position: [2, 0.7, 4], color: "#ffb703" },
  { id: "combatDummy", skillId: "combat", name: "Training Dummy", xp: 18, position: [-4, 0.9, 3], color: "#ef476f" },
];

const INTERACTION_RANGE = 2.2;
const ACTION_COOLDOWN = 0.45;
const RUNNING_XP_PER_SECOND = 5.5;
const MIN_RUNNING_SPEED = 0.25;
const KEYBOARD_MAP = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["Shift"] },
  { name: "action1", keys: ["1"] },
  { name: "action2", keys: ["2"] },
  { name: "action3", keys: ["3"] },
  { name: "action4", keys: ["KeyF"] },
];

const useKeyboard = () => {
  const [pressed, setPressed] = useState({});

  useEffect(() => {
    const down = (event) => setPressed((state) => ({ ...state, [event.code]: true }));
    const up = (event) => setPressed((state) => ({ ...state, [event.code]: false }));

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  return pressed;
};

const TrainingStation = ({ station }) => (
  <group position={station.position}>
    <mesh castShadow receiveShadow>
      <cylinderGeometry args={[0.75, 0.75, 1.4, 20]} />
      <meshStandardMaterial color={station.color} roughness={0.55} metalness={0.12} />
    </mesh>
    <mesh position={[0, 1.15, 0]} castShadow>
      <sphereGeometry args={[0.32, 20, 20]} />
      <meshStandardMaterial color={station.color} emissive={station.color} emissiveIntensity={0.28} />
    </mesh>
  </group>
);

function ProgressionTracker({ controllerRef, trainingStations, keys }) {
  const lastActionAt = useRef(0);
  const addExperience = useRpgProgressionStore((state) => state.addExperience);

  const playerPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const rigidBody = controllerRef.current?.group;
    if (!rigidBody) {
      return;
    }

    const translation = rigidBody.translation();
    playerPosition.set(translation.x, translation.y, translation.z);

    const velocity = rigidBody.linvel();
    const horizontalSpeed = Math.hypot(velocity.x, velocity.z);

    if (horizontalSpeed > MIN_RUNNING_SPEED) {
      addExperience("running", delta * RUNNING_XP_PER_SECOND, "movement");
    }

    const canInteract = keys.KeyE && performance.now() - lastActionAt.current > ACTION_COOLDOWN * 1000;

    if (!canInteract) {
      return;
    }

    const nearestStation = trainingStations.find(
      (station) => playerPosition.distanceTo(station.vector) <= INTERACTION_RANGE
    );

    if (!nearestStation) {
      return;
    }

    addExperience(nearestStation.skillId, nearestStation.xp, nearestStation.name);
    lastActionAt.current = performance.now();
  });

  return null;
}

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
      position={[0, 1.5, 0]}
      ref={controllerRef}
    >
      <CharacterModel />
    </Ecctrl>
  );
}

export default function RpgProgressionDemoScene() {
  const controllerRef = useRef();
  const keys = useKeyboard();
  const resetProgression = useRpgProgressionStore((state) => state.resetProgression);

  const trainingStations = useMemo(
    () => TRAINING_STATIONS.map((station) => ({ ...station, vector: new THREE.Vector3(...station.position) })),
    []
  );

  useEffect(() => {
    const onReset = (event) => {
      if (event.code === "KeyR") {
        resetProgression();
      }
    };

    window.addEventListener("keydown", onReset);
    return () => window.removeEventListener("keydown", onReset);
  }, [resetProgression]);

  return (
    <>
      <color attach="background" args={["#11131a"]} />
      <fog attach="fog" args={["#11131a", 10, 35]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        castShadow
        position={[8, 12, 6]}
        intensity={1.3}
        shadow-mapSize={[2048, 2048]}
      />

      <Physics timeStep="vary">
        <KeyboardControls map={KEYBOARD_MAP}>
          <PlayerCharacter controllerRef={controllerRef} />
        </KeyboardControls>

        <ProgressionTracker controllerRef={controllerRef} trainingStations={trainingStations} keys={keys} />

        <RigidBody type="fixed" colliders="cuboid" position={[0, -0.15, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[30, 0.3, 30]} />
            <meshStandardMaterial color="#202737" roughness={0.95} metalness={0.1} />
          </mesh>
        </RigidBody>

        {trainingStations.map((station) => (
          <TrainingStation key={station.id} station={station} />
        ))}
      </Physics>

      <ProgressionHud />
    </>
  );
}
