import { Float } from "@react-three/drei";
import { ResourceNode, UnlockShrine } from "../components/StageInteractables";
import { RESOURCE_TYPES } from "../config/stageConfig";

export default function PaleGardenStage() {
  return (
    <group>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[12, 14, 1.4, 36]} />
        <meshStandardMaterial color="#f4f7f2" roughness={0.75} metalness={0.08} />
      </mesh>

      {[
        [-10, 3.8, -4],
        [9, 4.2, -8],
        [8, 3.4, 9],
      ].map((pos, idx) => (
        <Float key={idx} speed={0.7 + idx * 0.2}>
          <mesh position={pos}>
            <sphereGeometry args={[1.6, 18, 18]} />
            <meshStandardMaterial color="#ffffff" emissive="#d5fff9" emissiveIntensity={0.15} />
          </mesh>
        </Float>
      ))}

      <ResourceNode position={[-8, 1.4, 1]} resource={RESOURCE_TYPES.LUMEN_SHARD} color="#d5f1ff" amount={2} />
      <ResourceNode position={[6, 1.7, 5]} resource={RESOURCE_TYPES.LUMEN_SHARD} color="#caf4ff" amount={2} />
      <ResourceNode position={[1.5, 1.4, -7]} resource={RESOURCE_TYPES.AETHER_PEARL} color="#efd9ff" amount={1} />

      <UnlockShrine
        position={[0, 1.8, 10]}
        unlockKey="choirRuinsAccess"
        label="Attune Choir Ruins Route"
        requiredCost={{ [RESOURCE_TYPES.LUMEN_SHARD]: 4, [RESOURCE_TYPES.AETHER_PEARL]: 1 }}
      />
    </group>
  );
}
