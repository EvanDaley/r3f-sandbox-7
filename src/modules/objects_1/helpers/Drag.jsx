import { createRef, useCallback, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { usePointToPointConstraint, useSphere } from '@react-three/cannon'
import * as THREE from 'three'

const cursor = createRef()

/** Distance from camera along the look-at-mouse ray (scroll to change). */
let cursorDepth = 15
const CURSOR_DEPTH_MIN = 2
const CURSOR_DEPTH_MAX = 80
const CURSOR_DEPTH_SCROLL_SENSITIVITY = 1

/** True while user is dragging a body part (pointer down on a draggable). */
let isDragging = false

function useDragConstraint(child) {
  const [, , api] = usePointToPointConstraint(cursor, child, { pivotA: [0, 0, 0], pivotB: [0, 0, 0] })
  useEffect(() => void api.disable(), [])
  const onPointerUp = useCallback((e) => {
    isDragging = false
    document.body.style.cursor = 'grab'
    e.target.releasePointerCapture(e.pointerId)
    api.disable()
  }, [])
  const onPointerDown = useCallback((e) => {
    isDragging = true
    document.body.style.cursor = 'grabbing'
    e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)
    api.enable()
  }, [])
  return { onPointerUp, onPointerDown }
}

function Cursor() {
  const [, api] = useSphere(() => ({ collisionFilterMask: 0, type: 'Kinematic', mass: 0, args: [0.5] }), cursor)
  const raycaster = useRef(new THREE.Raycaster()).current
  const temp = useRef(new THREE.Vector3()).current

  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault()
      cursorDepth = Math.min(CURSOR_DEPTH_MAX, Math.max(CURSOR_DEPTH_MIN, cursorDepth - e.deltaY * 0.01 * CURSOR_DEPTH_SCROLL_SENSITIVITY))
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  useFrame((state) => {
    raycaster.setFromCamera(state.pointer, state.camera)

    if (!isDragging) {
      const hits = raycaster.intersectObjects(state.scene.children, true)
      const hit = hits.find((h) => {
        let o = h.object
        while (o) {
          if (o.userData?.isDragCursor) return false
          o = o.parent
        }
        return true
      })
      if (hit) cursorDepth = Math.min(CURSOR_DEPTH_MAX, Math.max(CURSOR_DEPTH_MIN, hit.distance))
    }

    temp.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, cursorDepth)
    api.position.set(temp.x, temp.y, temp.z)

    const mesh = cursor.current?.children[0]
    if (mesh) mesh.visible = isDragging
  })

  return (
    <group ref={cursor} userData={{ isDragCursor: true }}>
      <mesh castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ffaa44" emissive="#884400" transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

export { useDragConstraint, cursor, Cursor }
