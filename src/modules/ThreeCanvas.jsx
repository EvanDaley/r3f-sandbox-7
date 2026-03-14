import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import React from "react";
import { Bvh } from "@react-three/drei";
import useSceneStore from "../stores/sceneStore";

export default function ThreeCanvas() {
  const currentSceneId = useSceneStore((state) => state.currentSceneId);
  const SceneComponent = useSceneStore(
    (state) => state.scenes.find((s) => s.id === state.currentSceneId)?.scene
  );

  // useEffect(() => {
  //   const onMouseUp = (event) => {
  //     if (event.button === 1 && document.pointerLockElement) {
  //       document.exitPointerLock();
  //     }
  //   };

  //   window.addEventListener("mouseup", onMouseUp);
  //   return () => window.removeEventListener("mouseup", onMouseUp);
  // }, []);

  // Match ragdoll-physics-forked App.js for Objects 1 scene: no Bvh, no pointer handlers
  const isObjects1 = currentSceneId === "1_objects";
  const cameraProps = isObjects1
    ? { position: [-40, 40, 40], fov: 25, near: 1, far: 100 }
    : undefined;
  const dpr = isObjects1 ? [1, 2] : undefined;
  const flat = isObjects1;

  const pointerHandlers = isObjects1
    ? {}
    : {
        onPointerDown: (e) => {
          if (e.pointerType === "mouse" && e.button === 1) {
            const canvas = e.target;
            if (document.pointerLockElement !== canvas) {
              canvas.requestPointerLock();
            }
          }
        },
        onPointerUp: (e) => {
          if (
            e.pointerType === "mouse" &&
            e.button === 1 &&
            document.pointerLockElement === e.target
          ) {
            document.exitPointerLock();
          }
        },
      };

  return (
    <>
      {SceneComponent && (
        <Canvas
          shadows
          flat={flat}
          {...(cameraProps && { camera: cameraProps })}
          {...(dpr && { dpr })}
          {...pointerHandlers}
        >
          {isObjects1 ? (
            <Suspense fallback={null}>{React.createElement(SceneComponent)}</Suspense>
          ) : (
            <Suspense fallback={null}>
              <Bvh firstHitOnly>{React.createElement(SceneComponent)}</Bvh>
            </Suspense>
          )}
        </Canvas>
      )}
    </>
  );
}
