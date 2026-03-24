import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Grid, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Physics, usePlane } from "@react-three/cannon";
import { EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { Cursor } from "./helpers/Drag.jsx";
import { setLimbReleaseCallback } from "./helpers/limbAttachmentBridge";
import { Guy, ATTACHABLE_LIMBS } from "./components/Guy";
import { GrabTargetPivot } from "./components/GrabTargetPivot";
import { Chair, Table, Mug, Lamp } from "./components/Furniture";

const FLOOR_Y = -5;

const GRAB_TARGETS_INITIAL = [
  [4.5, 8.8, 0],
  [-4.5, 7.2, 0],
  [0, 8.4, 4.5],
  [0, 7.6, -4.5],
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

function targetIsHeld(limbTargetIndex, targetIndex) {
  return ATTACHABLE_LIMBS.some((limb) => limbTargetIndex[limb] === targetIndex);
}

export default function Objects1Scene() {
  const [grabTargetPositions, setGrabTargetPositions] = useState(() =>
    GRAB_TARGETS_INITIAL.map((p) => [...p])
  );
  /** Which grab pad each limb is stuck to (anchors follow grabTargetPositions[index]). */
  const [limbTargetIndex, setLimbTargetIndex] = useState(() => {
    const o = {};
    ATTACHABLE_LIMBS.forEach((k) => (o[k] = null));
    return o;
  });
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  const targetsRef = useRef(grabTargetPositions);
  targetsRef.current = grabTargetPositions;

  const onLimbRelease = useCallback((limbName, worldPosition) => {
    if (!ATTACHABLE_LIMBS.includes(limbName)) return;
    let bestIdx = null;
    let bestDist = STICK_THRESHOLD;
    targetsRef.current.forEach((pos, i) => {
      const d = distance3(worldPosition, pos);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    });
    setLimbTargetIndex((prev) => ({
      ...prev,
      [limbName]: bestIdx,
    }));
  }, []);

  const handleTargetMove = useCallback((index, newPos) => {
    setGrabTargetPositions((prev) => {
      const next = [...prev];
      next[index] = newPos;
      return next;
    });
  }, []);

  const attachments = useMemo(() => {
    const o = {};
    for (const limb of ATTACHABLE_LIMBS) {
      const idx = limbTargetIndex[limb];
      o[limb] = idx != null ? [...grabTargetPositions[idx]] : null;
    }
    return o;
  }, [limbTargetIndex, grabTargetPositions]);

  const pauseOrbit = useCallback(() => setOrbitEnabled(false), []);
  const resumeOrbit = useCallback(() => setOrbitEnabled(true), []);

  useEffect(() => {
    setLimbReleaseCallback(onLimbRelease);
    return () => setLimbReleaseCallback(null);
  }, [onLimbRelease]);

  useEffect(() => {
    const onPointerUp = () => setOrbitEnabled(true);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  return (
    <>
      <OrbitControls
        makeDefault
        enabled={orbitEnabled}
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
        <Guy rotation={[-Math.PI / 3, 0, 0]} attachments={attachments} />
        {grabTargetPositions.map((pos, i) => (
          <GrabTargetPivot
            key={i}
            position={pos}
            color={i % 2 === 0 ? "#4ade80" : "#22d3ee"}
            held={targetIsHeld(limbTargetIndex, i)}
            onMove={(newPos) => handleTargetMove(i, newPos)}
            onGizmoDragStart={pauseOrbit}
            onGizmoDragEnd={resumeOrbit}
          />
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
        <ToneMapping />
      </EffectComposer>
    </>
  );
}
