import React, {useRef, useState, useCallback} from "react";
import OrthoZoomOnlyFollow from "../../../components/controls/OrthoZoomOnlyFollow";
import SimpleLighting2 from "../../../components/environment/SimpleLighting2";
import EffectsV2 from "../../../components/effects/EffectsV2";
import TileGrid from "../../procedural_ground/components/TileGrid";
import TreeApprox1 from "../../dynamic_colors/objects/TreeApprox1";
import Turret1 from "../../dynamic_colors/objects/Turret1";
import Turret2 from "../../dynamic_colors/objects/Turret2";
import Turret3 from "../../dynamic_colors/objects/Turret3";
import {usePaletteStore} from "../../dynamic_colors/stores/paletteStore";
import MoveablePlayers1 from "../movement_sandbox_2/MoveablePlayers1";
import Desk1 from "../../dynamic_colors/objects/Desk1";
import DebugCameraAxisBoxMaterial from "../../../components/wrappers/DebugCameraAxisBoxMaterial";

export default function MovementSandbox3() {
  const activePalette = usePaletteStore((s) => s.activePalette);
  const [localPlayerRef, setLocalPlayerRef] = useState(null);

  // Callback to receive local player ref from MoveablePlayers1
  const handleLocalPlayerRef = useCallback((ref) => {
    setLocalPlayerRef(ref);
  }, []);

  // Scatter trees around the scene
  const treePositions = [
    [-8, 0, 6],
    [-8, 0, -10],
    [8, 0, 6],
    [8, 0, -10],
    [-5, 0, 0],
    [5, 0, 0],
    [0, 0, 8],
    [0, 0, -8],
    [-10, 0, 3],
    [10, 0, -3],
  ];

  return (
    <>
      <MoveablePlayers1 onLocalPlayerRef={handleLocalPlayerRef}/>

      <color attach="background" args={["#3c2828"]}/>
      <OrthoZoomOnlyFollow targetRef={localPlayerRef}/>
      <SimpleLighting2/>
      <EffectsV2/>
      <TileGrid/>

      {/* Turrets */}
      <group position={[0, 0, 0]}>
        <Turret1
          materials={activePalette}
          position={[-3, 0, 0]}
        />
        <Turret2
          materials={activePalette}
          position={[3, 0, 0]}
        />
        <Turret3
          materials={activePalette}
          position={[0, 0, -3]}
        />
      </group>

      {/* Scattered trees */}
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

      {/* Desks */}
      <group position={[-5, 0, 5]}>
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
    </>
  );
}

