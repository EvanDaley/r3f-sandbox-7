import { Html } from '@react-three/drei';

const promptStyle = {
  color: '#f8fafc',
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 0.2,
  padding: '4px 8px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.25)',
  background: 'rgba(9, 11, 19, 0.85)',
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

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
        <Html position={[0, 2.2, 0]} center sprite distanceFactor={10}>
          <div style={promptStyle}>{`[E] {${station.name}}`}</div>
        </Html>
      )}
    </group>
  );
}
