import { ResourceNode, UnlockShrine } from "../components/StageInteractables";
import { RESOURCE_TYPES } from "../config/stageConfig";

export default function SanctuaryHaloStage() {
  return (
    <group>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[6.5, 8.2, 2.4, 32]} />
        <meshStandardMaterial color="#f5f5f8" metalness={0.15} roughness={0.6} />
      </mesh>

      <mesh position={[0, 3.2, -5]}>
        <torusGeometry args={[5.2, 0.3, 24, 64]} />
        <meshStandardMaterial color="#fff4c8" emissive="#f9ebbe" emissiveIntensity={0.4} />
      </mesh>

      <ResourceNode position={[-6, 1.2, -3]} resource={RESOURCE_TYPES.PALE_DUST} color="#fef6d8" amount={2} />
      <ResourceNode position={[5, 1.4, -5]} resource={RESOURCE_TYPES.PALE_DUST} color="#fff6df" amount={2} />
      <ResourceNode position={[3, 1.6, 7]} resource={RESOURCE_TYPES.VEIL_FIBER} color="#dbf6f4" amount={1} />

      <UnlockShrine
        position={[0, 1.8, 8]}
        unlockKey="paleGardenAccess"
        label="Attune Pale Garden Route"
        requiredCost={{ [RESOURCE_TYPES.PALE_DUST]: 4, [RESOURCE_TYPES.VEIL_FIBER]: 2 }}
      />
    </group>
  );
}
