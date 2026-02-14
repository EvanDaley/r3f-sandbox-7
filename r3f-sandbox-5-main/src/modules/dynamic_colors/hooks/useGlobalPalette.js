import {useEffect, useState} from "react"
import {SkeletonUtils} from "three-stdlib"
import {applyPaletteMaterials} from "../utils/applyPaletteMaterials"

/**
 * usePaletteScene
 *
 * Clones a cached GLTF scene and reapplies materials whenever the palette changes.
 *
 * @param {THREE.Object3D} originalScene - The scene from useGLTF
 * @param {Object} materials - An object of toon materials (p, e, s, t)
 * @returns {THREE.Object3D | null} A cloned scene with materials applied
 */
export function useGlobalPalette(originalScene, materials) {
  const [scene, setScene] = useState(null)

  useEffect(() => {
    if (!materials) throw new Error("Object missing materials")

    if (!originalScene) return

    // Clone the scene to avoid mutating the cached GLTF instance
    const cloned = SkeletonUtils.clone(originalScene)

    // Apply the new palette materials
    applyPaletteMaterials(cloned, materials)

    // Update the local state
    setScene(cloned)

    // Clean up the old clone when palette changes
    return () => {
      setScene(null)
    }
  }, [originalScene, materials])

  return scene
}
