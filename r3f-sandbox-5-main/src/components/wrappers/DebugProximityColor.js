import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePaletteStore } from '../../modules/dynamic_colors/stores/paletteStore'

/**
 * DebugProximityColor
 * 
 * Debug tool that swaps objects to a palette material when they're within a certain distance of the player.
 * Uses the 'e' (error/red) material from the palette when within proximity.
 */
export default function DebugProximityColor({
  playerRef,
  proximityDistance = 4.0,
  paletteKey = 'e', // Use 'e' (error/red) material from palette
  children,
  ...props
}) {
  const groupRef = useRef()
  const activePalette = usePaletteStore((s) => s.activePalette)
  const originalMaterials = useRef(new Map())

  useFrame(() => {
    if (!groupRef.current || !playerRef?.current || !activePalette) return

    // Get the debug material from palette
    const debugMaterial = activePalette[paletteKey]
    if (!debugMaterial) return

    // Get player position
    const playerPos = new THREE.Vector3()
    playerRef.current.getWorldPosition(playerPos)

    // Update each mesh individually
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        // Get this specific mesh's world position
        const objectPos = new THREE.Vector3()
        child.getWorldPosition(objectPos)
        
        // Calculate distance to player
        const distance = playerPos.distanceTo(objectPos)

        // Update materials for this specific mesh
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material, index) => {
          if (material) {
            // Store original material on first access
            const materialKey = `${child.uuid}-${index}`
            if (!originalMaterials.current.has(materialKey)) {
              originalMaterials.current.set(materialKey, material)
            }

            // Swap to debug material if within proximity, otherwise restore original
            if (distance < proximityDistance) {
              if (Array.isArray(child.material)) {
                child.material[index] = debugMaterial
              } else {
                child.material = debugMaterial
              }
            } else {
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

