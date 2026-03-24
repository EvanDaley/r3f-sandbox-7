import { useCallback, useEffect, useState } from "react";
import { Grid, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Physics, usePlane } from "@react-three/cannon";
import { EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { Cursor } from "./helpers/Drag.jsx";
import { setLimbReleaseCallback } from "./helpers/limbAttachmentBridge";
import { Guy, ATTACHABLE_LIMBS } from "./components/Guy";
import { GrabTarget } from "./components/GrabTarget";
import { Chair, Table, Mug, Lamp } from "./components/Furniture";

const FLOOR_Y = -5;

const GRAB_TARGETS = [
  [4.5, 4.4, 0],
  [-4.5, 3.6, 0],
  [0, 4.2, 4.5],
  [0, 3.8, -4.5],
];

const STICK_THRESHOLD = 3;

function Floor(props) {
  const [ref] = usePlane(() => ({ type: "Static", ...props }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial color="black" transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function distance3(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export default function Objects1Scene() {
  const [animationMode, setAnimationMode] = useState("ragdoll");
  const [rifleMode, setRifleMode] = useState(false);
  const [isFiring, setIsFiring] = useState(false);

  const [attachments, setAttachments] = useState(() => {
    const o = {};
    ATTACHABLE_LIMBS.forEach((k) => (o[k] = null));
    return o;
  });

  const onLimbRelease = useCallback((limbName, worldPosition) => {
    if (!ATTACHABLE_LIMBS.includes(limbName)) return;
    let best = null;
    let bestDist = STICK_THRESHOLD;
    for (const pos of GRAB_TARGETS) {
      const d = distance3(worldPosition, pos);
      if (d < bestDist) {
        bestDist = d;
        best = pos;
      }
    }
    setAttachments((prev) => ({
      ...prev,
      [limbName]: best ? [...best] : null,
    }));
  }, []);

  useEffect(() => {
    setLimbReleaseCallback(onLimbRelease);
    return () => setLimbReleaseCallback(null);
  }, [onLimbRelease]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.repeat) return;
      if (e.code === "KeyM") {
        setAnimationMode((prev) => (prev === "walk" ? "ragdoll" : "walk"));
      }
      if (e.code === "KeyR") {
        setRifleMode((prev) => !prev);
      }
      if (e.code === "Space") {
        setIsFiring(true);
      }
    };
    const onKeyUp = (e) => {
      if (e.code === "Space") {
        setIsFiring(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <>
      <div style={hudStyle}>
        <div style={hudTitleStyle}>Ragdoll Animator</div>
        <button
          type="button"
          style={hudButtonStyle}
          onClick={() => setAnimationMode((prev) => (prev === "walk" ? "ragdoll" : "walk"))}
        >
          Mode: {animationMode === "walk" ? "Walking" : "Ragdoll"} (M)
        </button>
        <button type="button" style={hudButtonStyle} onClick={() => setRifleMode((prev) => !prev)}>
          Rifle: {rifleMode ? "Ready" : "Holstered"} (R)
        </button>
        <button
          type="button"
          style={{ ...hudButtonStyle, background: isFiring ? "#7f1d1d" : "rgba(35,35,35,0.95)" }}
          onMouseDown={() => setIsFiring(true)}
          onMouseUp={() => setIsFiring(false)}
          onMouseLeave={() => setIsFiring(false)}
        >
          Fire: {isFiring ? "BANG" : "Idle"} (Hold Space)
        </button>
      </div>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={8}
        maxDistance={85}
        mouseButtons={{ LEFT: null, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.ROTATE }}
      />
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
        <Guy
          rotation={[-Math.PI / 3, 0, 0]}
          attachments={attachments}
          animationMode={animationMode}
          rifleActive={rifleMode}
          isFiring={isFiring && rifleMode}
        />
        {GRAB_TARGETS.map((pos, i) => (
          <GrabTarget key={i} position={pos} color={i % 2 === 0 ? "#4ade80" : "#22d3ee"} />
        ))}
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
        sectionColor={[0.2, 0.2, 0.2]}
        fadeDistance={300}
      />
      <EffectComposer disableNormalPass>
        {/* <Bloom luminanceThreshold={2} mipmapBlur /> */}
        <ToneMapping />
      </EffectComposer>
    </>
  );
}

const hudStyle = {
  position: "fixed",
  top: 72,
  right: 12,
  zIndex: 150,
  background: "rgba(0,0,0,0.65)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 10,
  padding: 10,
  display: "flex",
  flexDirection: "column",
  gap: 6,
  minWidth: 230,
  backdropFilter: "blur(4px)",
};

const hudTitleStyle = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 0.3,
};

const hudButtonStyle = {
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(35,35,35,0.95)",
  color: "white",
  borderRadius: 8,
  padding: "7px 10px",
  textAlign: "left",
  cursor: "pointer",
};
