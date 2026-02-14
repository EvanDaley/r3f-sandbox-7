import React from "react"
import PaletteModel from "./PaletteModel"

export default function Building2({ materials, ...props }) {
  return (
    <PaletteModel
      file="palette_testing/building2.glb"
      materials={materials}
      outline
      outlineProps={{ thickness: 2.04, color: "black",  }}
      castShadow
      {...props}
    />
  )
}
