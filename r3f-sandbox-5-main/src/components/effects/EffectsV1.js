import {Bloom, EffectComposer, Vignette} from "@react-three/postprocessing";
import React from "react";

export default function EffectsV1() {
    return (
        <>
            <EffectComposer>
                <Bloom intensity={1.05} luminanceThreshold={.95} />
                {/*<Vignette eskil={false} offset={0.1} darkness={0.2} />*/}
            </EffectComposer>
        </>
    )
}