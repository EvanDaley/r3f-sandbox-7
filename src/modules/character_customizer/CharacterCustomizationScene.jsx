import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import CustomizableCharacter from "./components/CustomizableCharacter";

export default function CharacterCustomizationScene() {
  return (
    <>
      <color attach="background" args={["#0f172a"]} />
      <fog attach="fog" args={["#0f172a", 10, 22]} />
      <PerspectiveCamera makeDefault position={[0, 1.5, 4.8]} fov={34} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.15}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-3, 2.2, 2]} intensity={0.65} color="#93c5fd" />

      <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.6, 64]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      <CustomizableCharacter />

      <OrbitControls
        target={[0, 0.9, 0]}
        minPolarAngle={Math.PI / 2.25}
        maxPolarAngle={Math.PI / 1.95}
        minDistance={4}
        maxDistance={6.2}
        enablePan={false}
      />
    </>
  );
}
