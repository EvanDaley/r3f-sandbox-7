import { useMemo } from "react"
import { useGLTF } from "@react-three/drei"
import { useGlobalPalette } from "../hooks/useGlobalPalette"

/**
 * usePaletteMeshes
 *
 * Loads a GLTF model, applies the global palette, and returns its mesh list.
 *
 * @param {string} relativePath - Model path relative to /models/
 * @param {Object} materials - Palette materials (p, e, s, t, etc.)
 * @returns {{ meshes: THREE.Mesh[] }} Mesh array ready for rendering
 */
export function usePaletteMeshes(relativePath, materials) {
  const basePath = window.location.href + "/models/"
  const { scene: original } = useGLTF(basePath + relativePath)
  const scene = useGlobalPalette(original, materials)

  const meshes = useMemo(() => {
    if (!scene) return []
    const arr = []
    scene.traverse((child) => {
      if (child.isMesh) arr.push(child)
    })
    return arr
  }, [scene])

  return { meshes }
}
