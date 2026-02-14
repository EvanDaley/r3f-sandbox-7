import OrthoZoomOnly from "../../components/controls/OrthoZoomOnly";
import SimpleLighting2 from "../../components/environment/SimpleLighting2";
import EffectsV2 from "../../components/effects/EffectsV2";
import TileGrid from "../procedural_ground/components/TileGrid";
import FloatingRobot from "../dynamic_colors/objects/FloatingRobot";
import {usePaletteStore} from "../dynamic_colors/stores/paletteStore";
import MoveablePlayers1 from "../networking_focus/movement_sandbox_2/MoveablePlayers1";

export default function LandingArea() {
  const activePalette = usePaletteStore((s) => s.activePalette)

  return (
    <>
      <OrthoZoomOnly />
      <SimpleLighting2 />
      <EffectsV2 />
      <color attach="background" args={['#28293c']} />

      <TileGrid debugTile={false} />

      {/*<FloatingRobot*/}
      {/*  materials={activePalette}*/}
      {/*  position={[0, 0, -4]}*/}
      {/*/>*/}
      {/*<FloatingRobot*/}
      {/*  rotation={[0, Math.PI, 0]}*/}
      {/*  materials={activePalette}*/}
      {/*  position={[0, 0, 6]}*/}
      {/*/>*/}

      <MoveablePlayers1/>

    </>
  )
}
