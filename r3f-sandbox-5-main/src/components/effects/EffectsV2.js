import {Bloom, EffectComposer, Vignette} from "@react-three/postprocessing";
import React from "react";

export default function EffectsV2() {
    return (
        <>
            <EffectComposer>
                <Bloom intensity={2} luminanceThreshold={.8} />
                {/*<Vignette eskil={false} offset={0.1} darkness={0.2} />*/}
            </EffectComposer>
        </>
    )
}