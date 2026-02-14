import OrthoV2 from "../../components/controls/OrthoV2"
import SimpleLighting from "../../components/environment/SimpleLighting"
import PaletteTest1 from "./objects/PaletteTest1"
import { usePaletteStore } from "./stores/paletteStore"

export default function PaletteSandbox() {
    const activePalette = usePaletteStore((s) => s.activePalette)

    return (
        <>
            <color attach="background" args={["#181818"]} />
            <OrthoV2 />
            <SimpleLighting directionalIntensity={3} />
            <PaletteTest1 materials={activePalette} />
        </>
    )
}
