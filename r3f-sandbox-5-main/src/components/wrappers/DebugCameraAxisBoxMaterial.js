import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { usePaletteStore } from '../../modules/dynamic_colors/stores/paletteStore'

/**
 * DebugCameraAxisBoxMaterial
 * 
 * Swaps objects to a palette material when they're within a box between the camera and player.
 * The box extends along the camera's forward axis from camera to player, with a margin width
 * on the orthogonal axes.
 */
export default function DebugCameraAxisBoxMaterial({
  playerRef,
  paletteKey = 'transparent',
  margin = 2.0, // Width/height of the box on orthogonal axes
  children,
  ...props
}) {
  const groupRef = useRef()
  const { camera, scene } = useThree()
  const activePalette = usePaletteStore((s) => s.activePalette)
  const originalMaterials = useRef(new Map())
  const boxHelperRef = useRef()

  useFrame(() => {
    if (!groupRef.current || !playerRef?.current || !camera || !activePalette) return

    // Get the transparent material from palette
    const transparentMaterial = activePalette[paletteKey]
    if (!transparentMaterial) return

    // Get camera forward direction (same as working DebugCameraAxisMaterial)
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

    // Get camera right and up for box visualization and material detection
    // Extract directly from camera's world matrix to get exact orientation
    const cameraRight = new THREE.Vector3()
    const cameraUp = new THREE.Vector3()
    const cameraForwardFromMatrix = new THREE.Vector3()
    camera.matrixWorld.extractBasis(cameraRight, cameraUp, cameraForwardFromMatrix)
    // cameraForwardFromMatrix is negative Z, so we use our calculated cameraForward instead

    // Create or update box geometry for visualization
    // DISABLED: Box helper turned off since showing/hiding is working well
    // if (!boxHelperRef.current && playerProjection > 0) {
    //   const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
    //   const boxEdges = new THREE.EdgesGeometry(boxGeometry)
    //   const boxMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 })
    //   boxHelperRef.current = new THREE.LineSegments(boxEdges, boxMaterial)
    //   scene.add(boxHelperRef.current)
    // }

    // Update box position, rotation, and scale
    // DISABLED: Box helper turned off since showing/hiding is working well
    // if (boxHelperRef.current && playerProjection > 0) {
    //   // Position box at camera, then offset forward by half depth
    //   const boxCenter = cameraPos.clone().add(cameraForward.clone().multiplyScalar(playerProjection / 2))
    //   boxHelperRef.current.position.copy(boxCenter)

    //   // Use camera's quaternion and rotate 180° around Y so box extends forward
    //   // (camera forward is -Z, but BoxGeometry depth is +Z)
    //   const yRot180 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI)
    //   boxHelperRef.current.quaternion.copy(camera.quaternion).multiply(yRot180)

    //   // Scale box: width/height = margin*2, depth = playerProjection
    //   boxHelperRef.current.scale.set(margin * 2, margin * 2, playerProjection)
    // }

    // Update each mesh individually (using the working material swapping logic)
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        // Get this specific mesh's world position
        const objectPos = new THREE.Vector3()
        child.getWorldPosition(objectPos)

        // Calculate object position relative to camera
        const objectRelative = new THREE.Vector3().subVectors(objectPos, cameraPos)
        
        // Project onto camera axes
        const forwardDist = objectRelative.dot(cameraForward)
        const rightDist = objectRelative.dot(cameraRight)
        const upDist = objectRelative.dot(cameraUp)

        // Check if object is within the box
        // Forward: between 0 and playerProjection
        // Right/Up: within margin distance
        const isInBox = 
          forwardDist >= 0 && 
          forwardDist <= playerProjection &&
          Math.abs(rightDist) <= margin &&
          Math.abs(upDist) <= margin * 2

        // Update materials for this specific mesh
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material, index) => {
          if (material) {
            // Store original material on first access
            const materialKey = `${child.uuid}-${index}`
            if (!originalMaterials.current.has(materialKey)) {
              originalMaterials.current.set(materialKey, material)
            }

            // Swap to transparent material if object is in box
            if (isInBox) {
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

