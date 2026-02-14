import { Sky } from "@react-three/drei";
import EffectsV2 from "../../../components/effects/EffectsV2";
import SimpleLighting2 from "../../../components/environment/SimpleLighting2";
import TileGridV2 from "./components/TileGridV2";
import OrthoV2 from "../../../components/controls/OrthoV2";
import TerrainDecorations from "./components/TerrainDecorations";

export default function Forest1() {
    return (
        <>
            <color attach="background" args={["#87CEEB"]} />
            {/* <PerspectiveFollow targetRef={localPlayerRef} /> */}
            <SimpleLighting2 />
            <EffectsV2 />
            <TileGridV2 />
            <TerrainDecorations />
            <OrthoV2/>
        </>
    )
}