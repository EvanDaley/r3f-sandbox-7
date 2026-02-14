import React from "react"
import { Outlines } from "@react-three/drei"
import { usePaletteMeshes } from "../hooks/usePaletteMeshes"

/**
 * PaletteModel
 *
 * Generic wrapper to render any palette-aware GLTF model with outlines.
 */
export default function PaletteModel({
                                       file, // relative to /models/
                                       materials,
                                       outline = true,
                                       outlineProps = {},
                                       castShadow = true,
                                       receiveShadow = false,
                                       ...props
                                     }) {
  const { meshes } = usePaletteMeshes(file, materials)

  if (!meshes?.length) return null

  return (
    <group {...props}>
      {meshes.map((mesh) => (
        <mesh
          key={mesh.uuid}
          geometry={mesh.geometry}
          material={mesh.material}
          position={mesh.position}
          rotation={mesh.rotation}
          scale={mesh.scale}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        />
      ))}
    </group>
  )
}
