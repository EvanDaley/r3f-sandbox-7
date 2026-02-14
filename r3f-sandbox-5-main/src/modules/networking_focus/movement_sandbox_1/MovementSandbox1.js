import React, { useRef } from "react";
import { usePaletteStore } from "../../dynamic_colors/stores/paletteStore";
import OrthoZoomOnly from "../../../components/controls/OrthoZoomOnly";
import SimpleLighting2 from "../../../components/environment/SimpleLighting2";
import EffectsV2 from "../../../components/effects/EffectsV2";
import TileGrid from "../../procedural_ground/components/TileGrid";
import FloatingRobot from "../../dynamic_colors/objects/FloatingRobot";
import LittleRobot from "../../dynamic_colors/objects/LittleRobot";
import useRobotMovement from "./hooks/useRobotMovement";
import {useTimeIncrement} from "../general_connection_tooling/hook_examples/useTimeIncrement";

export default function MovementSandbox1() {
  const time = useTimeIncrement();

  const activePalette = usePaletteStore((s) => s.activePalette);
  const littleRef = useRef();

  useRobotMovement(littleRef);

  return (
    <>
      <OrthoZoomOnly />
      <SimpleLighting2 />
      <EffectsV2 />
      <color attach="background" args={["#3c2828"]} />

      <TileGrid />
      <LittleRobot ref={littleRef} materials={activePalette} position={[0, 0, 4]}/>

      <FloatingRobot
        rotation={[0, Math.PI, 0]}
        materials={activePalette}
        position={[0, 0, 6]}
      />
    </>
  );
}
