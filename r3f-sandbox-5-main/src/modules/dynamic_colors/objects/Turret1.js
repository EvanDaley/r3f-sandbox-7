
import React from "react"
import PaletteModel from "./PaletteModel"

export default function Turret1({ materials, ...props }) {
  return (
    <PaletteModel
      file="palette_testing/turret1.glb"
      materials={materials}
      outline
      castShadow
      receiveShadow
      {...props}
    />
  )
}
