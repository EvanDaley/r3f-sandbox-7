import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { usePaletteStore } from '../../modules/dynamic_colors/stores/paletteStore'

/**
 * DebugCameraAxisMaterial
 * 
 * Debug tool that swaps objects to a palette material when they're further along the camera axis
 * than the player. Useful for testing camera-axis-based detection.
 */
export default function DebugCameraAxisMaterial({
  playerRef,
  paletteKey = 'transparent', // Use 'transparent' material from palette
  children,
  ...props
}) {
  const groupRef = useRef()
  const { camera } = useThree()
  const activePalette = usePaletteStore((s) => s.activePalette)
  const originalMaterials = useRef(new Map())

  useFrame(() => {
    if (!groupRef.current || !playerRef?.current || !camera || !activePalette) return

    // Get the transparent material from palette
    const transparentMaterial = activePalette[paletteKey]
    if (!transparentMaterial) return

    // Get camera forward direction
    const cameraForward = new THREE.Vector3()
    camera.getWorldDirection(cameraForward)

    // Get camera position
    const cameraPos = new THREE.Vector3()
    camera.getWorldPosition(cameraPos)

    // Get player world position
    const playerPos = new THREE.Vector3()
    playerRef.current.getWorldPosition(playerPos)

    // Calculate player projection onto camera forward axis
    const playerRelative = new THREE.Vector3().subVectors(playerPos, cameraPos)
    const playerProjection = playerRelative.dot(cameraForward)

    // Update each mesh individually
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        // Get this specific mesh's world position
        const objectPos = new THREE.Vector3()
        child.getWorldPosition(objectPos)

        // Calculate object projection onto camera forward axis
        const objectRelative = new THREE.Vector3().subVectors(objectPos, cameraPos)
        const objectProjection = objectRelative.dot(cameraForward)

        // Update materials for this specific mesh
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material, index) => {
          if (material) {
            // Store original material on first access
            const materialKey = `${child.uuid}-${index}`
            if (!originalMaterials.current.has(materialKey)) {
              originalMaterials.current.set(materialKey, material)
            }

            // Swap to transparent material if object is closer along camera axis than player
            // (objectProjection < playerProjection means object is closer to camera in view direction)
            if (objectProjection < playerProjection) {
              if (Array.isArray(child.material)) {
                child.material[index] = transparentMaterial
              } else {
                child.material = transparentMaterial
              }
            } else {
              // Restore original material
              const originalMaterial = originalMaterials.current.get(materialKey)
              if (originalMaterial) {
                if (Array.isArray(child.material)) {
                  child.material[index] = originalMaterial
                } else {
                  child.material = originalMaterial
                }
              }
            }
          }
        })
      }
    })
  })

  return (
    <group ref={groupRef} {...props}>
      {children}
    </group>
  )
}

