import { Sky, Stars } from "@react-three/drei";

export default function CosmicAetherEnvironment({ fogDensity = 0.03, accent = "#f6edd6" }) {
  return (
    <>
      <color attach="background" args={["#f9f9ff"]} />
      <fogExp2 attach="fog" args={["#f9f9ff", fogDensity]} />

      <ambientLight intensity={1.5} color="#ffffff" />
      <directionalLight position={[20, 35, 12]} intensity={1.1} color="#fffbe8" castShadow />
      <pointLight position={[0, 9, 0]} intensity={1.5} color={accent} />

      <Sky sunPosition={[2, 1.1, 8]} turbidity={1.2} rayleigh={0.6} mieCoefficient={0.003} mieDirectionalG={0.95} />
      <Stars radius={220} depth={80} count={800} factor={2} saturation={0.1} fade speed={0.1} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.02, 0]}>
        <circleGeometry args={[85, 96]} />
        <meshStandardMaterial color="#f7f7f3" roughness={0.82} metalness={0.04} />
      </mesh>
    </>
  );
}
