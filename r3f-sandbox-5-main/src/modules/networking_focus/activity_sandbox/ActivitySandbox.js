import React, { useRef, useState, useCallback, useEffect } from "react";
import PerspectiveFollow from "../../../components/controls/PerspectiveFollow";
import SimpleLighting2 from "../../../components/environment/SimpleLighting2";
import EffectsV2 from "../../../components/effects/EffectsV2";
import TileGrid from "../../procedural_ground/components/TileGrid";
import { usePaletteStore } from "../../dynamic_colors/stores/paletteStore";
import MoveablePlayersV2 from "./MoveablePlayersV2";
import CarryableBox from "./components/CarryableBox";
import { useInteraction } from "./hooks/useInteraction";
import { useSharedObjectsStore } from "./stores/useSharedObjectsStore";
import { useSharedObjectsNetwork } from "./hooks/useSharedObjectsNetwork";
import { usePeerStore } from "../general_connection_tooling/stores/peerStore";
import Desk from "../../../components/props/sprites/Desk";
import Desk1 from "../../dynamic_colors/objects/Desk1";

export default function ActivitySandbox() {
  const activePalette = usePaletteStore((s) => s.activePalette);
  const [localPlayerRef, setLocalPlayerRef] = useState(null);
  const peerId = usePeerStore((s) => s.peerId);
  
  // Initialize networking for shared objects
  useSharedObjectsNetwork();

  const handleLocalPlayerRef = useCallback((ref) => {
    setLocalPlayerRef(ref);
  }, []);

  // Set up interaction system
  useInteraction(localPlayerRef);

  // Initialize boxes - host creates them, clients receive via network
  const boxes = [
    { id: "box1", position: { x: 2, y: 0, z: 0 } },
    { id: "box2", position: { x: 3, y: 0, z: 0 } },
    { id: "box3", position: { x: -3, y: 0, z: 3 } },
  ];

  // Initialize boxes in store (host initializes, clients get them from network)
  useEffect(() => {
    if (!peerId) return;
    
    boxes.forEach((box) => {
      const currentObject = useSharedObjectsStore.getState().objects[box.id];
      if (!currentObject) {
        useSharedObjectsStore.getState().setObject(box.id, {
          position: box.position,
          heldBy: [],
          type: 'box',
        });
      }
    });
  }, [peerId]);

  return (
    <>
      <MoveablePlayersV2 onLocalPlayerRef={handleLocalPlayerRef} />

      {/* <Desk position={[-5, .8, -5.5]} scale={[3,3,3]} /> */}
      <group position={[-10, 0, 0]}>
        {[-5, 0, 5].map((x) =>
          ([-4, -2, 0, 2, 4].map((z) =>
            <Desk1
              key={`desk1-${x}-${z}`}
              position={[x, 0, z]}
              scale={[1,1,1]}
              materials={activePalette}
            />
          ))
        )}
      </group>
      <color attach="background" args={["#3c2828"]} />
      <PerspectiveFollow targetRef={localPlayerRef} />
      <SimpleLighting2 />
      <EffectsV2 />
      <TileGrid />

      {/* Render carryable boxes */}
      {boxes.map((box) => (
        <CarryableBox
          key={box.id}
          boxId={box.id}
          initialPosition={box.position}
          materials={activePalette}
        />
      ))}
    </>
  );
}

