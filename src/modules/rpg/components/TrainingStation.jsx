import { Text } from '@react-three/drei';

export default function TrainingStation({ station, showInteractPrompt }) {
  return (
    <group position={station.position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.75, 0.75, 1.4, 20]} />
        <meshStandardMaterial color={station.color} roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshStandardMaterial color={station.color} emissive={station.color} emissiveIntensity={0.28} />
      </mesh>

      {showInteractPrompt && (
        <Text
          position={[0, 2.15, 0]}
          fontSize={0.25}
          color='#f8fafc'
          anchorX='center'
          anchorY='middle'
          outlineWidth={0.03}
          outlineColor='#090b13'
        >
          {`[E] {${station.name}}`}
        </Text>
      )}
    </group>
  );
}
