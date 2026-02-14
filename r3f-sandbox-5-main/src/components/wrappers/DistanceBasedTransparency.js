import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * DistanceBasedTransparency
 * 
 * A wrapper component that makes its children transparent when they're closer to the camera
 * than the player. Useful for isometric games where objects can block the view.
 */
export default function DistanceBasedTransparency({
  playerRef,
  minOpacity = 0.3,
  maxOpacity = 1.0,
  fadeRange = 2.0,
  children,
  ...props
}) {
  const groupRef = useRef()
  const { camera } = useThree()

  useFrame(() => {
    if (!groupRef.current || !playerRef?.current || !camera) return

    // Get positions
    const cameraPos = new THREE.Vector3()
    const playerPos = new THREE.Vector3()
    
    camera.getWorldPosition(cameraPos)
    playerRef.current.getWorldPosition(playerPos)

    // Calculate player distance once
    const playerDistance = cameraPos.distanceTo(playerPos)

    // Update each mesh individually with its own position
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        // Get this specific mesh's world position
        const objectPos = new THREE.Vector3()
        child.getWorldPosition(objectPos)
        
        // Calculate distance for this specific object
        const objectDistance = cameraPos.distanceTo(objectPos)

        // Calculate opacity for this object
        let opacity = maxOpacity
        if (objectDistance < playerDistance) {
          const diff = playerDistance - objectDistance
          const fadeFactor = Math.min(diff / fadeRange, 1.0)
          opacity = THREE.MathUtils.lerp(minOpacity, maxOpacity, 1.0 - fadeFactor)
        }

        // Update materials for this specific mesh
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((material) => {
          if (material) {
            material.opacity = opacity
            material.transparent = true
            material.needsUpdate = true
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
