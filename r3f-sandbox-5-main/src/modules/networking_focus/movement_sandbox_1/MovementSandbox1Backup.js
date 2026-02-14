

import React, { useRef } from "react";
import OrthoZoomOnly from "../../../components/controls/OrthoZoomOnly";
import SimpleLighting2 from "../../../components/environment/SimpleLighting2";
import EffectsV2 from "../../../components/effects/EffectsV2";
import TileGrid from "../../procedural_ground/components/TileGrid";
import {usePlayerMovement} from "./hooks/usePlayerMovement";
import {usePlayerStore} from "./stores/usePlayerStore";
import {usePeerStore} from "../general_connection_tooling/stores/peerStore";

export default function MovementSandbox1() {
  usePlayerMovement(); // subscribe + simulate movement

  const players = usePlayerStore((s) => s.players);
  const { peerId, hostId } = usePeerStore((s) => ({
    peerId: s.peerId,
    hostId: s.hostId,
  }));

  return (
    <>
      <OrthoZoomOnly />
      <SimpleLighting2 />
      <EffectsV2 />
      <color attach="background" args={["#3c2828"]} />
      <TileGrid />

      {Object.entries(players).map(([id, pos]) => {
        const isHostPlayer = id === hostId;
        const isSelf = id === peerId;
        const scale = isHostPlayer ? 2 : 1;
        const color = isHostPlayer ? "orange" : "deepskyblue";


        return (
          <mesh key={id} position={[pos.x, pos.y, pos.z]} scale={scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </>
  );
}
