import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Grid, Environment } from "@react-three/drei";
import { Physics, usePlane } from "@react-three/cannon";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import { Cursor } from "./helpers/Drag";
import { Guy } from "./components/Guy";
import { Chair, Table, Mug, Lamp } from "./components/Furniture";

const FLOOR_Y = -5;

function ClearFog() {
  const scene = useThree((s) => s.scene);
  useLayoutEffect(() => {
    scene.fog = null;
    return () => {};
  }, [scene]);
  return null;
}

function Floor(props) {
  const [ref] = usePlane(() => ({ type: "Static", ...props }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="black" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

export default function Objects1Scene() {
  return (
    <>
      {/* <ClearFog /> */}
      {/* <Environment background preset="sunset" blur={1} /> */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.2}
        castShadow
        shadowMapSize={[1024, 1024]}
        shadowBias={-0.001}
      />
      <spotLight
        position={[10, 15, 10]}
        angle={0.5}
        penumbra={1}
        intensity={1.2}
        castShadow
        shadowBias={-0.001}
        shadowMapSize={1024}
      />
      <pointLight position={[-15, 12, -15]} color="#ff8866" intensity={25} distance={45} decay={2} />
      <pointLight position={[20, 8, 10]} color="#6688ff" intensity={20} distance={40} decay={2} />
      <pointLight position={[-10, 8, -10]} intensity={0.8} />
      <Physics allowSleep={false} iterations={15} gravity={[0, -200, 0]}>
        <Cursor />
        <Guy rotation={[-Math.PI / 3, 0, 0]} />
        <Floor position={[0, FLOOR_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        <Chair position={[0, 0, -2.52]} />
        <Table position={[8, 0, 0]} />
        <Mug position={[8, 3, 0]} />
        <Lamp position={[0, 15, 0]} />
      </Physics>
      <Grid
        renderOrder={-1}
        position={[0, FLOOR_Y, 0]}
        infiniteGrid
        cellSize={0.6}
        cellThickness={0.6}
        sectionSize={3.3}
        sectionThickness={1.5}
        sectionColor={[0.5, 0.5, 10]}
        // fadeDistance={30}
      />
      <EffectComposer disableNormalPass>
        {/* <Bloom luminanceThreshold={2} mipmapBlur /> */}
        <ToneMapping />
      </EffectComposer>
    </>
  );
}
