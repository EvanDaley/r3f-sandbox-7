import {useControls} from "leva";
import OrthoZoomOnly from "../../components/controls/OrthoZoomOnly";
import SimpleLighting2 from "../../components/environment/SimpleLighting2";
import EffectsV2 from "../../components/effects/EffectsV2";
import TileGrid from "../procedural_ground/components/TileGrid";
import FloatingRobot from "../dynamic_colors/objects/FloatingRobot";
import {usePaletteStore} from "../dynamic_colors/stores/paletteStore";
import {useAbilityStore} from "./stores/abilityStore";
import {useFrame} from "@react-three/fiber";
import AbilitySpawner from "./objects/AbilitySpawner";
import MoveablePlayers1 from "../networking_focus/movement_sandbox_2/MoveablePlayers1";

export default function AbilitiesSandbox1() {
  const activePalette = usePaletteStore((s) => s.activePalette)

  const { debugTile } = useControls('Debug', {
    debugTile: { value: false, label: 'Debug Tiles' },
  })

  const tick = useAbilityStore((s) => s.tick)

  useFrame(() => {
    tick()
  })

  return (
    <>
      <OrthoZoomOnly />
      <SimpleLighting2 />
      <EffectsV2 />
      <color attach="background" args={['#cccccc']} />

      <TileGrid debugTile={debugTile} />

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

      <AbilitySpawner/>
    </>
  )
}
