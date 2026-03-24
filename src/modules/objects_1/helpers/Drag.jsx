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

/** True while any pointer button is held down (orbit, drag, etc.). */
let isPointerDown = false

function useDragConstraint(child, options = {}) {
  const { onDragStart, onDragEnd } = options
  const [, , api] = usePointToPointConstraint(cursor, child, { pivotA: [0, 0, 0], pivotB: [0, 0, 0] })
  useEffect(() => void api.disable(), [])
  const onPointerUp = useCallback((e) => {
    if (e.button !== 0) return
    isDragging = false
    document.body.style.cursor = 'grab'
    e.target.releasePointerCapture(e.pointerId)
    api.disable()
    onDragEnd?.()
  }, [api, onDragEnd])
  const onPointerDown = useCallback((e) => {
    if (e.button !== 0) return
    isDragging = true
    document.body.style.cursor = 'grabbing'
    e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)
    api.enable()
    onDragStart?.()
  }, [api, onDragStart])
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
    const onPointerDown = () => { isPointerDown = true }
    const onPointerUp = () => { isPointerDown = false }
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  useFrame((state) => {
    raycaster.setFromCamera(state.pointer, state.camera)

    if (!isDragging && !isPointerDown) {
      const hits = raycaster.intersectObjects(state.scene.children, true)
      const cursorRoot = cursor.current
      const hit = hits.find((h) => {
        let o = h.object
        while (o) {
          if (o === cursorRoot) return false
          o = o.parent
        }
        return true
      })
      if (hit) cursorDepth = Math.min(CURSOR_DEPTH_MAX, Math.max(CURSOR_DEPTH_MIN, hit.distance))
    }

    temp.copy(raycaster.ray.origin).addScaledVector(raycaster.ray.direction, cursorDepth)
    api.position.set(temp.x, temp.y, temp.z)
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
