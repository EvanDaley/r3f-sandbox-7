import React, { useRef, useState, useCallback } from "react";
import PerspectiveFollow from "../../../components/controls/PerspectiveFollow";
import SimpleLighting2 from "../../../components/environment/SimpleLighting2";
import EffectsV2 from "../../../components/effects/EffectsV2";
import TileGrid from "../../procedural_ground/components/TileGrid";
import { usePaletteStore } from "../../dynamic_colors/stores/paletteStore";
import MoveablePlayersV3 from "./MoveablePlayersV3";

export default function GravitySandbox() {
  const activePalette = usePaletteStore((s) => s.activePalette);
  const [localPlayerRef, setLocalPlayerRef] = useState(null);

  const handleLocalPlayerRef = useCallback((ref) => {
    setLocalPlayerRef(ref);
  }, []);

  return (
    <>
      <MoveablePlayersV3 onLocalPlayerRef={handleLocalPlayerRef} />
      <color attach="background" args={["#3c2828"]} />
      <PerspectiveFollow targetRef={localPlayerRef} />
      <SimpleLighting2 />
      <EffectsV2 />
      <TileGrid />
    </>
  );
}

