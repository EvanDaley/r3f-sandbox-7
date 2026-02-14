import React, { useRef, useState, useCallback } from "react";
import PerspectiveFollow from "../../../components/controls/PerspectiveFollow";
import SimpleLighting2 from "../../../components/environment/SimpleLighting2";
import EffectsV2 from "../../../components/effects/EffectsV2";
import { usePaletteStore } from "../../dynamic_colors/stores/paletteStore";
import MoveablePlayersV4 from "../bomb_game/MoveablePlayersV4";
import GameGround from "../bomb_game/components/GameGround";
import TileGrid from "../../procedural_ground/components/TileGrid";
import TreeApprox1 from "../../dynamic_colors/objects/TreeApprox1";
import Turret1 from "../../dynamic_colors/objects/Turret1";
import Turret2 from "../../dynamic_colors/objects/Turret2";
import Turret3 from "../../dynamic_colors/objects/Turret3";
import Building1 from "../../dynamic_colors/objects/Building1";
import Building2 from "../../dynamic_colors/objects/Building2";
import Desk1 from "../../dynamic_colors/objects/Desk1";
import DebugCameraAxisBoxMaterial from "../../../components/wrappers/DebugCameraAxisBoxMaterial";

export default function MovementSandbox4() {
  const activePalette = usePaletteStore((s) => s.activePalette);
  const [localPlayerRef, setLocalPlayerRef] = useState(null);

  // Callback to receive local player ref from MoveablePlayersV4
  const handleLocalPlayerRef = useCallback((ref) => {
    setLocalPlayerRef(ref);
  }, []);

  // Scatter trees around the scene in a larger area
  const treePositions = [
    [-12, 0, 10],
    [-12, 0, -12],
    [12, 0, 10],
    [12, 0, -12],
    [-8, 0, 8],
    [8, 0, 8],
    [-8, 0, -8],
    [8, 0, -8],
    [-5, 0, 0],
    [5, 0, 0],
    [0, 0, 10],
    [0, 0, -10],
    [-15, 0, 5],
    [15, 0, -5],
    [-10, 0, 15],
    [10, 0, -15],
  ];

  return (
    <>
      <MoveablePlayersV4 onLocalPlayerRef={handleLocalPlayerRef} />

      <color attach="background" args={["#2a1f1f"]} />
      <PerspectiveFollow targetRef={localPlayerRef} />
      <SimpleLighting2 />
      <EffectsV2 />
      
      {/* GameGround from bomb_game - checkerboard style */}
      <GameGround size={60} gridSize={12} />
      
      {/* TileGrid for additional ground detail */}
      <TileGrid />

      {/* Central turret group */}
      <group position={[0, 0, 0]}>
        <Turret1
          materials={activePalette}
          position={[-4, 0, 0]}
        />
        <Turret2
          materials={activePalette}
          position={[4, 0, 0]}
        />
        <Turret3
          materials={activePalette}
          position={[0, 0, -4]}
        />
      </group>

      {/* Additional turrets scattered around */}
      <group position={[-10, 0, 10]}>
        <Turret1 materials={activePalette} />
      </group>
      <group position={[10, 0, -10]}>
        <Turret2 materials={activePalette} />
      </group>

      {/* Buildings with transparency effect */}
      <DebugCameraAxisBoxMaterial
        playerRef={localPlayerRef}
        margin={8.0}
      >
        <Building1
          materials={activePalette}
          position={[-8, 0, 8]}
        />
      </DebugCameraAxisBoxMaterial>
      
      <DebugCameraAxisBoxMaterial
        playerRef={localPlayerRef}
        margin={8.0}
      >
        <Building2
          materials={activePalette}
          position={[8, 0, -8]}
        />
      </DebugCameraAxisBoxMaterial>
      
      <DebugCameraAxisBoxMaterial
        playerRef={localPlayerRef}
        margin={8.0}
      >
        <Building1
          materials={activePalette}
          position={[-12, 0, -6]}
          rotation={[0, Math.PI / 4, 0]}
        />
      </DebugCameraAxisBoxMaterial>
      
      <DebugCameraAxisBoxMaterial
        playerRef={localPlayerRef}
        margin={8.0}
      >
        <Building2
          materials={activePalette}
          position={[12, 0, 6]}
          rotation={[0, -Math.PI / 4, 0]}
        />
      </DebugCameraAxisBoxMaterial>

      {/* Desk clusters */}
      <group position={[-6, 0, 6]}>
        <Desk1
          position={[0, 0, 0]}
          scale={[1, 1, 1]}
          materials={activePalette}
        />
        <Desk1
          position={[3, 0, 0]}
          scale={[1, 1, 1]}
          materials={activePalette}
        />
        <Desk1
          position={[0, 0, 3]}
          scale={[1, 1, 1]}
          materials={activePalette}
        />
      </group>

      <group position={[6, 0, -6]}>
        <Desk1
          position={[0, 0, 0]}
          scale={[1, 1, 1]}
          materials={activePalette}
        />
        <Desk1
          position={[-3, 0, 0]}
          scale={[1, 1, 1]}
          materials={activePalette}
        />
        <Desk1
          position={[0, 0, -3]}
          scale={[1, 1, 1]}
          materials={activePalette}
        />
      </group>

      {/* Scattered trees with transparency effect */}
      {treePositions.map((position, index) => (
        <DebugCameraAxisBoxMaterial
          key={`tree-${index}`}
          playerRef={localPlayerRef}
          margin={5.0}
        >
          <TreeApprox1
            materials={activePalette}
            position={position}
            scale={[1.5, 1.5, 1.5]}
            rotation={[0, Math.random() * Math.PI * 2, 0]}
          />
        </DebugCameraAxisBoxMaterial>
      ))}
    </>
  );
}

