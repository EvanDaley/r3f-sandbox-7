import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useNetworkingStore } from "@/modules/networking/stores/useNetworkingStore";
import { useNetworkedPlayersStore } from "@/modules/rpg/stores/useNetworkedPlayersStore";

const INTERPOLATION_ALPHA = 0.2;

function RemotePlayerMarker({ player }) {
  const rootRef = useRef();
  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetRotation = useMemo(() => new THREE.Quaternion(), []);

  useEffect(() => {
    targetPosition.set(player.position.x, player.position.y, player.position.z);
    targetRotation.set(player.rotation.x, player.rotation.y, player.rotation.z, player.rotation.w);
  }, [player.position, player.rotation, targetPosition, targetRotation]);

  useFrame(() => {
    if (!rootRef.current) return;

    rootRef.current.position.lerp(targetPosition, INTERPOLATION_ALPHA);
    rootRef.current.quaternion.slerp(targetRotation, INTERPOLATION_ALPHA);
  });

  return (
    <group ref={rootRef}>
      <mesh castShadow>
        <capsuleGeometry args={[0.28, 0.65, 6, 12]} />
        <meshStandardMaterial color='#4fd1c5' roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.55, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color='#7dd3fc' roughness={0.35} metalness={0.05} />
      </mesh>
    </group>
  );
}

export default function RemotePlayers() {
  const localPeerId = useNetworkingStore((state) => state.peerId);
  const remotePlayers = useNetworkedPlayersStore((state) => state.remotePlayers);

  return (
    <group>
      {Object.values(remotePlayers)
        .filter((player) => player.peerId !== localPeerId)
        .map((player) => (
          <RemotePlayerMarker key={player.peerId} player={player} />
        ))}
    </group>
  );
}
