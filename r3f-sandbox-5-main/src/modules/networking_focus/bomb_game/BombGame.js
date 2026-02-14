import React, { useRef, useState, useCallback, useEffect } from "react";
import PerspectiveFollow from "../../../components/controls/PerspectiveFollow";
import SimpleLighting2 from "../../../components/environment/SimpleLighting2";
import EffectsV2 from "../../../components/effects/EffectsV2";
import { usePaletteStore } from "../../dynamic_colors/stores/paletteStore";
import MoveablePlayersV4 from "./MoveablePlayersV4";
import GameGround from "./components/GameGround";
import Bomb from "./components/Bomb";
import { useInteraction } from "./hooks/useInteraction";
import { useSharedObjectsStore } from "./stores/useSharedObjectsStore";
import { useSharedObjectsNetwork } from "./hooks/useSharedObjectsNetwork";
import { usePeerStore } from "../general_connection_tooling/stores/peerStore";

export default function BombGame() {
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

  // Initialize bombs - host creates them, clients receive via network
  const bombs = [
    { id: "bomb1", position: { x: 2, y: 0, z: 0 } },
    { id: "bomb2", position: { x: -2, y: 0, z: 0 } },
    { id: "bomb3", position: { x: 0, y: 0, z: 2 } },
    { id: "bomb4", position: { x: 0, y: 0, z: -2 } },
  ];

  // Initialize bombs in store (host initializes, clients get them from network)
  useEffect(() => {
    if (!peerId) return;
    
    bombs.forEach((bomb) => {
      const currentObject = useSharedObjectsStore.getState().objects[bomb.id];
      if (!currentObject) {
        useSharedObjectsStore.getState().setObject(bomb.id, {
          position: bomb.position,
          heldBy: [],
          type: 'bomb',
        });
      }
    });
  }, [peerId]);

  return (
    <>
      <MoveablePlayersV4 onLocalPlayerRef={handleLocalPlayerRef} />
      <color attach="background" args={["#1a1a1a"]} />
      <PerspectiveFollow targetRef={localPlayerRef} />
      <SimpleLighting2 />
      <EffectsV2 />
      <GameGround size={50} gridSize={10} />

      {/* Render bombs */}
      {bombs.map((bomb) => (
        <Bomb
          key={bomb.id}
          bombId={bomb.id}
          initialPosition={bomb.position}
          materials={activePalette}
        />
      ))}
    </>
  );
}

