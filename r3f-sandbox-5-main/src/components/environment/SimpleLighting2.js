import React from "react";

export default function SimpleLighting2({
                                           ambientIntensity = 0.7,
                                           directionalPosition = [-8, 15, 8],
                                           directionalIntensity = 1.5,
                                       }) {
    return (
        <>
            {/* Ambient light adds soft fill lighting */}
            <ambientLight intensity={ambientIntensity} />

            {/* Directional light with shadows */}
            <directionalLight
                castShadow
                position={directionalPosition}
                intensity={directionalIntensity}

                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}

                shadow-camera-near={0.5}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
            />
        </>
    );
}
