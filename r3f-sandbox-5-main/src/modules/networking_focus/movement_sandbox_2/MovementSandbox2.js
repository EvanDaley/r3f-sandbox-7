import React, {useRef, useState, useCallback} from "react";
import OrthoZoomOnlyFollow from "../../../components/controls/OrthoZoomOnlyFollow";
import SimpleLighting2 from "../../../components/environment/SimpleLighting2";
import EffectsV2 from "../../../components/effects/EffectsV2";
import TileGrid from "../../procedural_ground/components/TileGrid";
import Building1 from "../../dynamic_colors/objects/Building1";
import Building2 from "../../dynamic_colors/objects/Building2";
import Tree1 from "../../dynamic_colors/objects/Tree1";
import Turret1 from "../../dynamic_colors/objects/Turret1";
import Turret2 from "../../dynamic_colors/objects/Turret2";
import Turret3 from "../../dynamic_colors/objects/Turret3";
import {usePaletteStore} from "../../dynamic_colors/stores/paletteStore";
import MoveablePlayers1 from "./MoveablePlayers1";
import Desk1 from "../../dynamic_colors/objects/Desk1";
import TreeApprox1 from "../../dynamic_colors/objects/TreeApprox1";

export default function MovementSandbox2() {
  const activePalette = usePaletteStore((s) => s.activePalette);
  const [localPlayerRef, setLocalPlayerRef] = useState(null);

  // Callback to receive local player ref from MoveablePlayers1
  const handleLocalPlayerRef = useCallback((ref) => {
    setLocalPlayerRef(ref);
  }, []);

  return (
    <>
      <MoveablePlayers1 onLocalPlayerRef={handleLocalPlayerRef}/>

      <color attach="background" args={["#3c2828"]}/>
      <OrthoZoomOnlyFollow targetRef={localPlayerRef}/>
      <SimpleLighting2/>
      <EffectsV2/>
      <TileGrid/>

      <group position={[-3, 0, 0]}>

        <group position={[0, 0, -3]} >
          <Building1
            materials={activePalette}
          />

          <Building2
            position={[-7.5, 0, 5]}
            materials={activePalette}
          />
        </group>

        <group position={[-3, 0, 0]} rotation={[0,Math.PI/2, 0]}>
          <Turret1
            materials={activePalette}
            position={[-3, 0, 0]}
          />
          <Turret2
            materials={activePalette}
            position={[-6, 0, 0]}
          />
          <Turret3
            materials={activePalette}
            position={[0, 0, 0]}
          />

        </group>
        {/* <Tree1
          materials={activePalette}
          position={[-8, 0, 6]}
          scale={[1.5, 1.5, 1.5]}
        /> */}
        <TreeApprox1
          materials={activePalette}
          position={[-8, 0, 6]}
          scale={[1.5, 1.5, 1.5]}
        />
        <TreeApprox1
          materials={activePalette}
          position={[-8, 0, -10]}
          scale={[1.5, 1.5, 1.5]}
          rotation={[0, Math.PI / 5, 0]}
        />
      </group>

      <group position={[-10, 0, -3]}>
        {[-3].map((x) =>
          ([-6, -4, -2, 0].map((z) =>
            <Desk1
              key={`desk1-${x}-${z}`}
              position={[x, 0, z]}
              scale={[1,1,1]}
              materials={activePalette}
            />
          ))
        )}
      </group>
    </>
  );
}
