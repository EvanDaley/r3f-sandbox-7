import { Clone, useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useNetworkingStore } from "@/modules/networking/stores/useNetworkingStore";
import { useNetworkedPlayersStore } from "@/modules/rpg/stores/useNetworkedPlayersStore";

const INTERPOLATION_ALPHA = 0.2;

function RemotePlayerAvatar({ player }) {
  const rootRef = useRef();
  const { scene, animations } = useGLTF("./models/third_person_controller/Floating Character.glb");
  const { actions } = useAnimations(animations, rootRef);

  const targetPosition = useMemo(() => new THREE.Vector3(), []);
  const targetRotation = useMemo(() => new THREE.Quaternion(), []);

  useEffect(() => {
    targetPosition.set(player.position.x, player.position.y - 0.6, player.position.z);
    targetRotation.set(player.rotation.x, player.rotation.y, player.rotation.z, player.rotation.w);
  }, [player.position, player.rotation, targetPosition, targetRotation]);

  useEffect(() => {
    if (!actions) return;

    const action = actions[player.animation] ?? actions.Idle;
    if (!action) return;

    action.reset().fadeIn(0.15).play();
    return () => action.fadeOut(0.15);
  }, [actions, player.animation]);

  useFrame(() => {
    if (!rootRef.current) return;
    rootRef.current.position.lerp(targetPosition, INTERPOLATION_ALPHA);
    rootRef.current.quaternion.slerp(targetRotation, INTERPOLATION_ALPHA);
  });

  return (
    <group ref={rootRef}>
      <Clone object={scene} scale={0.8} />
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
          <RemotePlayerAvatar key={player.peerId} player={player} />
        ))}
    </group>
  );
}

useGLTF.preload("./models/third_person_controller/Floating Character.glb");
