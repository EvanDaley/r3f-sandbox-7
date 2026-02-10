import { useHelper } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export default function Lights() {
  const directionalLightRef = useRef();

  // useHelper(directionalLightRef, THREE.DirectionalLightHelper, 1);

  return (
    <>
      <directionalLight
        castShadow
        shadow-normalBias={0.06}
        position={[20, 30, 10]}
        intensity={5}
        shadow-mapSize={[512, 512]}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-top={20}
        shadow-camera-right={20}
        shadow-camera-bottom={-20}
        shadow-camera-left={-20}
        name="followLight"
        ref={directionalLightRef}
      />
      <ambientLight intensity={2} />
    </>
  );
}
