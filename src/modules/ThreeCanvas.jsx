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

  // Scenes that don't work with BVH (e.g., CSG scenes)
  const scenesWithoutBvh = ["csgSandbox"];

  useEffect(() => {
    const onMouseUp = (event) => {
      if (event.button === 1 && document.pointerLockElement) {
        document.exitPointerLock();
      }
    };

    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, []);

  const shouldUseBvh = !scenesWithoutBvh.includes(currentSceneId);

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
              const canvas = e.target;
              if (document.pointerLockElement !== canvas) {
                canvas.requestPointerLock();
              }
            }
          }}
          onPointerUp={(e) => {
            if (
              e.pointerType === "mouse" &&
              e.button === 1 &&
              document.pointerLockElement === e.target
            ) {
              document.exitPointerLock();
            }
          }}
        >
          <Suspense fallback={null}>
            {shouldUseBvh ? (
              <Bvh firstHitOnly>{React.createElement(SceneComponent)}</Bvh>
            ) : (
              React.createElement(SceneComponent)
            )}
          </Suspense>
        </Canvas>
      )}
    </>
  );
}
