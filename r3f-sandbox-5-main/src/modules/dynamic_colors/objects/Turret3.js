
import React from "react"
import PaletteModel from "./PaletteModel"
import {Float} from "@react-three/drei";

export default function Turret3({ materials, ...props }) {
  return (
    <>
      <PaletteModel
        file="palette_testing/turret_base.glb"
        materials={materials}
        outline
        castShadow
        receiveShadow
        {...props}
      />

      <Float>
        <PaletteModel
          file="palette_testing/turret_top.glb"
          materials={materials}
          outline
          castShadow
          receiveShadow
          {...props}
        />
      </Float>
    </>
  )
}
