import { createRef, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { usePointToPointConstraint, useSphere } from '@react-three/cannon'
import { Plane, Vector3 } from 'three'

const cursor = createRef()

// Only one body part should be constrained to the cursor at a time.
// When a new part is grabbed, disable the previous one so the whole guy doesn’t get crushed to the mouse.
const activeDragApiRef = { current: null }

function useDragConstraint(child) {
  const [, , api] = usePointToPointConstraint(cursor, child, { pivotA: [0, 0, 0], pivotB: [0, 0, 0] })
  useEffect(() => void api.disable(), [])
  const onPointerUp = useCallback((e) => {
    document.body.style.cursor = 'grab'
    e.target.releasePointerCapture(e.pointerId)
    if (activeDragApiRef.current === api) activeDragApiRef.current = null
    api.disable()
  }, [api])
  const onPointerDown = useCallback((e) => {
    document.body.style.cursor = 'grabbing'
    e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)
    if (activeDragApiRef.current && activeDragApiRef.current !== api) activeDragApiRef.current.disable()
    activeDragApiRef.current = api
    api.enable()
  }, [api])
  return { onPointerUp, onPointerDown }
}

// Plane at y=0 so the cursor moves in 3D on the floor instead of crushing the ragdoll to z=0
const dragPlane = new Plane(new Vector3(0, 1, 0), 0)
const dragIntersect = new Vector3()

function Cursor() {
  const [, api] = useSphere(() => ({ collisionFilterMask: 0, type: 'Kinematic', mass: 0, args: [0.5] }), cursor)
  const { camera, raycaster } = useThree()
  useFrame((state) => {
    raycaster.setFromCamera(state.pointer, camera)
    raycaster.ray.intersectPlane(dragPlane, dragIntersect)
    api.position.set(dragIntersect.x, dragIntersect.y, dragIntersect.z)
  })
  return null
}

export { useDragConstraint, cursor, Cursor }
