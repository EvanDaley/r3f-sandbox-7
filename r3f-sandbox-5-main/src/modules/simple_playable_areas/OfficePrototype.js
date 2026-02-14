import OrthoZoomOnly from "../../components/controls/OrthoZoomOnly";
import SimpleLighting2 from "../../components/environment/SimpleLighting2";
import EffectsV2 from "../../components/effects/EffectsV2";
import TileGrid from "../procedural_ground/components/TileGrid";
import FloatingRobot from "../dynamic_colors/objects/FloatingRobot";
import {usePaletteStore} from "../dynamic_colors/stores/paletteStore";
import MoveablePlayers1 from "../networking_focus/movement_sandbox_2/MoveablePlayers1";
import OfficeImage from "../../components/props/sprites/OfficeImage";

export default function OfficePrototype() {
  const activePalette = usePaletteStore((s) => s.activePalette)

  return (
    <>
      <OfficeImage scale={[11,11,11]} position={[-10,0,-10]}/>

      <MoveablePlayers1/>


      <OrthoZoomOnly />
      <SimpleLighting2 />
      <EffectsV2 />
      <color attach="background" args={['#28293c']} />
      <TileGrid debugTile={false} />
    </>
  )
}
