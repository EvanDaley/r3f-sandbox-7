import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import React from "react";
import { Bvh } from "@react-three/drei";
import useSceneStore from "../stores/sceneStore";

export default function ThreeCanvas() {
  const SceneComponent = useSceneStore(
    (state) => state.scenes.find((s) => s.id === state.currentSceneId)?.scene
  );

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
            if (e.pointerType === "mouse") {
              e.target.requestPointerLock();
            }
          }}
        >
          <Suspense fallback={null}>
            <Bvh firstHitOnly>
              {React.createElement(SceneComponent)}
            </Bvh>
          </Suspense>
        </Canvas>
      )}
    </>
  );
}
