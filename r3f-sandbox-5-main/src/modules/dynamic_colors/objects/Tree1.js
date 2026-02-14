import React from "react"
import PaletteModel from "./PaletteModel"

export default function Tree1({ materials, ...props }) {
  return (
    <PaletteModel
      file="palette_testing/tree1.glb"
      materials={materials}
      outline
      outlineProps={{ thickness: 2.04, color: "black", screenspace: true, opacity: 1 }}
      castShadow
      {...props}
    />
  )
}

