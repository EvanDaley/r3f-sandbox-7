export default function TrainingStation({ station }) {
  return (
    <group position={station.position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.75, 0.75, 1.4, 20]} />
        <meshStandardMaterial color={station.color} roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshStandardMaterial
          color={station.color}
          emissive={station.color}
          emissiveIntensity={0.28}
        />
      </mesh>
    </group>
  );
}
