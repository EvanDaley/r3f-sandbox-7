import { KeyboardControls, MeshReflectorMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Physics, usePlane } from "@react-three/cannon";
import { CuboidCollider, Physics as RapierPhysics, RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import Ecctrl from "../third_person_controller/Ecctrl";
import { RPG_KEYBOARD_MAP } from "../rpg/config/progressionConfig";
import { Cursor } from "./helpers/Drag";
import { Guy } from "./components/Guy";

const SPAWN_POINT = [0, 0, 0];
const FLOOR_Y = -5;

function Floor(props) {
  const [ref] = usePlane(() => ({ type: "Static", ...props }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <MeshReflectorMaterial
        color="#878790"
        blur={[400, 400]}
        resolution={1024}
        mixBlur={1}
        mixStrength={3}
        depthScale={1}
        minDepthThreshold={0.85}
        metalness={0}
        roughness={1}
      />
    </mesh>
  );
}

function PlayerCharacter({ controllerRef }) {
  return (
    <Ecctrl
      springK={2}
      dampingC={0.2}
      camInitDis={-6}
      camMaxDis={-10}
      camCollisionOffset={0.3}
      camInitDir={{ x: 0.26, y: 0 }}
      camTargetPos={{ x: 0, y: 0.5, z: 0 }}
      position={SPAWN_POINT}
      ref={controllerRef}
    >
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#60a5fa" roughness={0.5} metalness={0.1} />
      </mesh>
    </Ecctrl>
  );
}

export default function Objects1Scene() {
  const controllerRef = useRef();

  useFrame(() => {
    const rigidBody = controllerRef.current?.group;
    if (!rigidBody) return;
    const { y } = rigidBody.translation();
    if (y < -10) {
      rigidBody.setTranslation({ x: SPAWN_POINT[0], y: SPAWN_POINT[1], z: SPAWN_POINT[2] }, true);
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <>
      <color attach="background" args={["#171720"]} />
      <fog attach="fog" args={["#171720", 60, 90]} />
      <ambientLight intensity={0.2} />
      <pointLight position={[-20, -5, -20]} color="red" />

      {/* Cannon: ragdoll + reflective floor */}
      <Physics allowSleep={false} iterations={15} gravity={[0, -200, 0]}>
        <Cursor />
        <Guy rotation={[-Math.PI / 3, 0, 0]} />
        <Floor position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} />
      </Physics>

      {/* Rapier: playable character (same floor height, collision-only) */}
      <RapierPhysics timeStep="vary">
        <KeyboardControls map={RPG_KEYBOARD_MAP}>
          <PlayerCharacter controllerRef={controllerRef} />
        </KeyboardControls>
        <RigidBody type="fixed" position={[0, FLOOR_Y, 0]}>
          <CuboidCollider args={[50, 0.1, 50]} />
        </RigidBody>
      </RapierPhysics>
    </>
  );
}
