import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import TrainingStation from "./components/TrainingStation";
import RpgPlayerCharacter, {
  TASK_ANIMATION_BY_SKILL,
} from "./components/RpgPlayerCharacter";
import { TRAINING_STATIONS } from "./config/trainingStations";
import useRpgInputState from "./core/input/useRpgInputState";
import useRpgProgressionStore from "./stores/useRpgProgressionStore";

const MOVEMENT_SPEED = 4.2;
const INTERACTION_RANGE = 2.2;
const ACTION_COOLDOWN = 0.45;

export default function RpgProgressionDemoScene() {
  const avatarRef = useRef();
  const lastActionAt = useRef(0);
  const taskAnimationUntil = useRef(0);
  const wasResetPressed = useRef(false);
  const [currentAnimation, setCurrentAnimation] = useState("Idle");

  const trainingStations = useMemo(
    () =>
      TRAINING_STATIONS.map((station) => ({
        ...station,
        vector: new THREE.Vector3(...station.position),
      })),
    []
  );

  const addExperience = useRpgProgressionStore((state) => state.addExperience);
  const resetProgression = useRpgProgressionStore((state) => state.resetProgression);
  const input = useRpgInputState();

  useFrame((_, delta) => {
    if (!avatarRef.current) {
      return;
    }

    const moveDirection = new THREE.Vector3(input.moveAxis.x, 0, input.moveAxis.z);

    if (moveDirection.lengthSq() > 0) {
      moveDirection.normalize().multiplyScalar(MOVEMENT_SPEED * delta);
      avatarRef.current.position.add(moveDirection);
      avatarRef.current.position.x = THREE.MathUtils.clamp(
        avatarRef.current.position.x,
        -9,
        9
      );
      avatarRef.current.position.z = THREE.MathUtils.clamp(
        avatarRef.current.position.z,
        -9,
        9
      );
      avatarRef.current.rotation.y = Math.atan2(moveDirection.x, moveDirection.z);
      addExperience("running", delta * 5.5, "movement");
      if (performance.now() > taskAnimationUntil.current) {
        setCurrentAnimation("Run");
      }
    } else if (performance.now() > taskAnimationUntil.current) {
      setCurrentAnimation("Idle");
    }

    const resetPressed = input.isPressed("resetProgression");
    if (resetPressed && !wasResetPressed.current) {
      resetProgression();
    }
    wasResetPressed.current = resetPressed;

    const canInteract =
      input.isPressed("interact") &&
      performance.now() - lastActionAt.current > ACTION_COOLDOWN * 1000;

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
    const stationAnimation =
      TASK_ANIMATION_BY_SKILL[nearestStation.skillId] ?? "Wave";
    setCurrentAnimation(stationAnimation);
    taskAnimationUntil.current = performance.now() + 700;
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

      <RpgPlayerCharacter
        ref={avatarRef}
        position={[0, 0.7, 0]}
        animationName={currentAnimation}
      />

      <OrbitControls
        makeDefault
        target={[0, 0.9, 0]}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={7}
        maxDistance={22}
        enablePan={false}
        mouseButtons={{
          LEFT: undefined,
          MIDDLE: THREE.MOUSE.ROTATE,
          RIGHT: THREE.MOUSE.DOLLY,
        }}
      />
    </>
  );
}
