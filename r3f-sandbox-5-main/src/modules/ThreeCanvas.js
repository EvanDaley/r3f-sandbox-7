import {Html, Loader} from '@react-three/drei'
import {Canvas} from '@react-three/fiber'
import React, {Suspense} from 'react'
import useSceneStore from '../stores/sceneStore'

export default function ThreeCanvas() {
  const SceneComponent = useSceneStore(
    state => state.scenes.find(s => s.id === state.currentSceneId)?.scene
  )

  return (
    <>
      {SceneComponent && (
        <Canvas dpr={[1, 2]} style={{ zIndex: 1 }} shadows={true} gl={{ antialias: true }}>
          <Suspense fallback={null}>
            {React.createElement(SceneComponent)}
          </Suspense>
        </Canvas>
      )}
      <Loader />
    </>
  )
}