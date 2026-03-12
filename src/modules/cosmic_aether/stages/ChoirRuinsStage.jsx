import { Float } from "@react-three/drei";
import { ResourceNode } from "../components/StageInteractables";
import { RESOURCE_TYPES } from "../config/stageConfig";

export default function ChoirRuinsStage() {
  return (
    <group>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[16, 18, 1.6, 40]} />
        <meshStandardMaterial color="#f7f5f8" roughness={0.7} metalness={0.2} />
      </mesh>

      <mesh position={[0, 6, -10]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[8, 0.45, 24, 80]} />
        <meshStandardMaterial color="#f6dfad" emissive="#f6dfad" emissiveIntensity={0.3} />
      </mesh>

      {[
        [-7, 4.8, -4],
        [7, 5.2, -3],
        [0, 5.6, 4],
      ].map((pos, idx) => (
        <Float key={idx} speed={0.4 + idx * 0.15} rotationIntensity={0.35}>
          <mesh position={pos}>
            <boxGeometry args={[2.2, 8.4, 2.2]} />
            <meshStandardMaterial color="#f0edff" metalness={0.25} roughness={0.45} />
          </mesh>
        </Float>
      ))}

      <ResourceNode position={[-5, 1.7, 8]} resource={RESOURCE_TYPES.AETHER_PEARL} color="#e7d1ff" amount={1} />
      <ResourceNode position={[6, 1.8, 6]} resource={RESOURCE_TYPES.LUMEN_SHARD} color="#caecff" amount={2} />
      <ResourceNode position={[2, 1.7, -6]} resource={RESOURCE_TYPES.VEIL_FIBER} color="#d7fff6" amount={2} />
    </group>
  );
}
