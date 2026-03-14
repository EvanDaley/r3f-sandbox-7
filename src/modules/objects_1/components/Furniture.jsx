import * as THREE from 'three'
import { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SpotLight } from '@react-three/drei'
import { useCompoundBody, useSphere, useCylinder, useDistanceConstraint, usePointToPointConstraint } from '@react-three/cannon'
import { useDragConstraint } from '../helpers/Drag.jsx'
import { Block } from '../helpers/Block'

export function Chair(props) {
  const [ref] = useCompoundBody(() => ({
    mass: 24,
    linearDamping: 0.95,
    angularDamping: 0.95,
    shapes: [
      { type: 'Box', mass: 10, position: [0, 0, 0], args: [3.1, 3.1, 0.5] },
      { type: 'Box', mass: 10, position: [0, -1.75, 1.25], args: [3.1, 0.5, 3.1] },
      { type: 'Box', mass: 1, position: [5 + -6.25, -3.5, 0], args: [0.5, 3, 0.5] },
      { type: 'Box', mass: 1, position: [5 + -3.75, -3.5, 0], args: [0.5, 3, 0.5] },
      { type: 'Box', mass: 1, position: [5 + -6.25, -3.5, 2.5], args: [0.5, 3, 0.5] },
      { type: 'Box', mass: 1, position: [5 + -3.75, -3.5, 2.5], args: [0.5, 3, 0.5] }
    ],
    ...props
  }))
  const bind = useDragConstraint(ref)
  return (
    <group ref={ref} {...bind}>
      <Block position={[0, 0, 0]} scale={[3.1, 3.1, 0.5]} />
      <Block position={[0, -1.75, 1.25]} scale={[3.1, 0.5, 3.1]} />
      <Block position={[5 + -6.25, -3.5, 0]} scale={[0.5, 3, 0.5]} />
      <Block position={[5 + -3.75, -3.5, 0]} scale={[0.5, 3, 0.5]} />
      <Block position={[5 + -6.25, -3.5, 2.5]} scale={[0.5, 3, 0.5]} />
      <Block position={[5 + -3.75, -3.5, 2.5]} scale={[0.5, 3, 0.5]} />
    </group>
  )
}

export function Mug(props) {
  const [cup] = useCylinder(() => ({ mass: 1, args: [0.62, 0.62, 1.2, 16], linearDamping: 0.95, angularDamping: 0.95, ...props }))
  const bind = useDragConstraint(cup)
  return (
    <group ref={cup} {...bind}>
      <mesh rotation={[Math.PI / 2, 0, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.62, 0.62, 1.2, 16]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  )
}

export function Table(props) {
  const [table] = useCompoundBody(() => ({
    mass: 54,
    linearDamping: 0.95,
    angularDamping: 0.95,
    shapes: [
      { type: 'Box', mass: 50, position: [0, 0, 0], args: [5, 0.5, 5] },
      { type: 'Box', mass: 1, position: [2, -2.25, 2], args: [0.5, 4, 0.5] },
      { type: 'Box', mass: 1, position: [-2, -2.25, -2], args: [0.5, 4, 0.5] },
      { type: 'Box', mass: 1, position: [-2, -2.25, 2], args: [0.5, 4, 0.5] },
      { type: 'Box', mass: 1, position: [2, -2.25, -2], args: [0.5, 4, 0.5] }
    ],
    ...props
  }))
  const bind = useDragConstraint(table)
  return (
    <group ref={table} {...bind}>
      <Block scale={[5, 0.5, 5]} position={[0, 0, 0]} />
      <Block scale={[0.5, 4, 0.5]} position={[2, -2.25, 2]} />
      <Block scale={[0.5, 4, 0.5]} position={[-2, -2.25, -2]} />
      <Block scale={[0.5, 4, 0.5]} position={[-2, -2.25, 2]} />
      <Block scale={[0.5, 4, 0.5]} position={[2, -2.25, -2]} />
    </group>
  )
}

export function Lamp(props) {
  const [target] = useState(() => new THREE.Object3D())
  const spotlightRef = useRef()
  const [fixed] = useSphere(() => ({ collisionFilterGroup: 0, type: 'Static', args: [0.2], ...props }))
  const [lamp] = useCylinder(() => ({ mass: 1, args: [0.5, 1.5, 2, 16], angularDamping: 0.95, linearDamping: 0.95, material: { friction: 0.9 }, ...props }))
  const bind = useDragConstraint(lamp)
  useDistanceConstraint(fixed, lamp, { distance: 2, pivotA: [0, 0, 0], pivotB: [0, 2, 0] })
  usePointToPointConstraint(fixed, lamp, { pivotA: [0, 0, 0], pivotB: [0, 2, 0] })
  useFrame((state) => {
    if (spotlightRef.current) {
      spotlightRef.current.intensity = 1.2 + Math.sin(state.clock.elapsedTime * 1.5) * 0.4
    }
  })
  return (
    <mesh ref={lamp} {...bind}>
      <cylinderGeometry args={[0.5, 1.5, 2, 32]} />
      <meshStandardMaterial color="#fff5e6" emissive="#ffdd99" emissiveIntensity={0.08} />
      <SpotLight
        ref={spotlightRef}
        castShadow
        target={target}
        penumbra={0.2}
        radiusTop={0.4}
        radiusBottom={40}
        distance={80}
        angle={0.45}
        attenuation={20}
        anglePower={5}
        intensity={1.2}
        color="#fff5e0"
        opacity={0.04}
      />
      <primitive object={target} position={[0, -1, 0]} />
    </mesh>
  )
}
