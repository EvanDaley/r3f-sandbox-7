import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import React from "react";
import { Bvh } from "@react-three/drei";
import useSceneStore from "../stores/sceneStore";

export default function ThreeCanvas() {
  const SceneComponent = useSceneStore(
    (state) => state.scenes.find((s) => s.id === state.currentSceneId)?.scene
  );


  useEffect(() => {
    const onMouseUp = (event) => {
      if (event.button === 1 && document.pointerLockElement) {
        document.exitPointerLock();
      }
    };

    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, []);

  return (
    <>
      {SceneComponent && (
        <Canvas
          shadows
          camera={{
            fov: 65,
            near: 0.1,
            far: 1000,
          }}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse" && e.button === 1) {
              const canvas = e.gl.domElement;
              if (document.pointerLockElement !== canvas) {
                canvas.requestPointerLock();
              }
            }
          }}
          onPointerUp={(e) => {
            if (
              e.pointerType === "mouse" &&
              e.button === 1 &&
              document.pointerLockElement === e.gl.domElement
            ) {
              document.exitPointerLock();
            }
          }}
        >
          <Suspense fallback={null}>
            <Bvh firstHitOnly>{React.createElement(SceneComponent)}</Bvh>
          </Suspense>
        </Canvas>
      )}
    </>
  );
}
