
import React from "react"
import PaletteModel from "./PaletteModel"

export default function Turret2({ materials, ...props }) {
  return (
    <PaletteModel
      file="palette_testing/turret2.glb"
      materials={materials}
      outline
      castShadow
      receiveShadow
      {...props}
    />
  )
}
