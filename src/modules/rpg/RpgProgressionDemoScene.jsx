import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import ProgressionHud from "./components/ProgressionHud";
import useRpgProgressionStore from "./stores/useRpgProgressionStore";

const TRAINING_STATIONS = [
  { id: "woodcuttingTree", skillId: "woodcutting", name: "Ancient Tree", xp: 22, position: [-5, 0.75, -2], color: "#8d6e63" },
  { id: "miningRock", skillId: "mining", name: "Ore Vein", xp: 20, position: [4, 0.8, -4], color: "#90a4ae" },
  { id: "craftingBench", skillId: "crafting", name: "Crafting Bench", xp: 24, position: [2, 0.7, 4], color: "#ffb703" },
  { id: "combatDummy", skillId: "combat", name: "Training Dummy", xp: 18, position: [-4, 0.9, 3], color: "#ef476f" },
];

const MOVEMENT_SPEED = 4.2;
const INTERACTION_RANGE = 2.2;
const ACTION_COOLDOWN = 0.45;

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

export default function RpgProgressionDemoScene() {
  const avatarRef = useRef();
  const lastActionAt = useRef(0);
  const trainingStations = useMemo(
    () => TRAINING_STATIONS.map((station) => ({ ...station, vector: new THREE.Vector3(...station.position) })),
    []
  );

  const keys = useKeyboard();
  const addExperience = useRpgProgressionStore((state) => state.addExperience);
  const resetProgression = useRpgProgressionStore((state) => state.resetProgression);

  useEffect(() => {
    const onReset = (event) => {
      if (event.code === "KeyR") {
        resetProgression();
      }
    };

    window.addEventListener("keydown", onReset);
    return () => window.removeEventListener("keydown", onReset);
  }, [resetProgression]);

  useFrame((_, delta) => {
    if (!avatarRef.current) {
      return;
    }

    const horizontal = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    const vertical = (keys.KeyS ? 1 : 0) - (keys.KeyW ? 1 : 0);
    const movement = new THREE.Vector3(horizontal, 0, vertical);

    if (movement.lengthSq() > 0) {
      movement.normalize().multiplyScalar(MOVEMENT_SPEED * delta);
      avatarRef.current.position.add(movement);
      avatarRef.current.position.x = THREE.MathUtils.clamp(avatarRef.current.position.x, -9, 9);
      avatarRef.current.position.z = THREE.MathUtils.clamp(avatarRef.current.position.z, -9, 9);
      addExperience("running", delta * 5.5, "movement");
    }

    const canInteract = keys.KeyE && performance.now() - lastActionAt.current > ACTION_COOLDOWN * 1000;

    if (!canInteract) {
      return;
    }

    const avatarPosition = avatarRef.current.position;
    const nearestStation = trainingStations.find(
      (station) => avatarPosition.distanceTo(station.vector) <= INTERACTION_RANGE
    );

    if (!nearestStation) {
      return;
    }

    addExperience(nearestStation.skillId, nearestStation.xp, nearestStation.name);
    lastActionAt.current = performance.now();
  });

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

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#202737" roughness={0.95} metalness={0.1} />
      </mesh>

      {trainingStations.map((station) => (
        <TrainingStation key={station.id} station={station} />
      ))}

      <mesh ref={avatarRef} position={[0, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.36, 0.7, 8, 12]} />
        <meshStandardMaterial color="#80ed99" emissive="#0f5132" emissiveIntensity={0.2} />
      </mesh>

      <OrbitControls makeDefault target={[0, 0.9, 0]} maxPolarAngle={Math.PI / 2.1} minDistance={7} maxDistance={22} />
      <ProgressionHud />
    </>
  );
}
