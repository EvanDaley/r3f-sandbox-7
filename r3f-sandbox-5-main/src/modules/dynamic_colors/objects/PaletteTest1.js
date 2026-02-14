import React from "react"
import {useGLTF} from "@react-three/drei"
import {useGlobalPalette} from "../hooks/useGlobalPalette"

export default function PaletteTest1({
                                       materials,
                                       ...props
                                     }) {
  const MODEL_PATH = window.location.href + "/models/palette_testing/paletteTest1.glb"
  const {scene: original} = useGLTF(MODEL_PATH)

  if (!materials) {
    throw new Error("Model requires a 'materials' prop with { p, e, s, t } keys")
  }

  const scene = useGlobalPalette(original, materials)

  if (!scene) return null

  return <primitive object={scene} {...props} />
}
