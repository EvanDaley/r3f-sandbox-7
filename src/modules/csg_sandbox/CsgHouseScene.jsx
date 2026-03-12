import * as THREE from 'three'
import { useRef, useCallback, useEffect } from 'react'
import { OrbitControls, PivotControls, Environment } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Geometry, Base, Subtraction, Addition } from '@react-three/csg'

// Shared geometries - created once and reused
const boxGeometry = new THREE.BoxGeometry()
const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 20)
const triangleGeometry = new THREE.CylinderGeometry(1, 1, 2, 3)

// Camera configuration
const CAMERA_CONFIG = {
  position: [-15, 10, 15],
  fov: 25,
  lookAt: [0, 0, 0],
}

export default function CsgHouseScene() {
  return (
    <>
      <color attach="background" args={['skyblue']} />
      <PerspectiveCamera />
      <House />
      <Environment preset="sunset" />
      <OrbitControls makeDefault />
    </>
  )
}

function PerspectiveCamera() {
  const { camera } = useThree()
  
  useEffect(() => {
    camera.position.set(...CAMERA_CONFIG.position)
    camera.fov = CAMERA_CONFIG.fov
    camera.updateProjectionMatrix()
    camera.lookAt(...CAMERA_CONFIG.lookAt)
  }, [camera])
  
  return null
}

function House() {
  const csgRef = useRef()
  
  const handleCsgUpdate = useCallback(() => {
    csgRef.current?.update()
  }, [])

  return (
    <mesh receiveShadow castShadow>
      <Geometry ref={csgRef} computeVertexNormals>
        <Base name="base" geometry={boxGeometry} scale={[3, 3, 3]} />
        <Subtraction name="cavity" geometry={boxGeometry} scale={[2.7, 2.7, 2.7]} />
        <Addition 
          name="roof" 
          geometry={triangleGeometry} 
          scale={[2.5, 1.5, 1.425]} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 2.2, 0]} 
        />
        <Chimney scale={0.5} position={[-0.75, 3, 0.8]} />
        <Window position={[1.1, 2.5, 0]} scale={0.6} rotation={[0, Math.PI / 2, 0]} />
        <Window position={[0, 2.5, 1.5]} scale={0.6} rotation={[0, 0, 0]} />
        
        <PivotControls 
          activeAxes={[false, true, true]} 
          rotation={[0, Math.PI / 2, 0]} 
          scale={1} 
          anchor={[0, 0, 0.4]} 
          onDrag={handleCsgUpdate}
        >
          <Window position={[0, 0.25, 1.5]} scale={1.25} />
        </PivotControls>
        
        <PivotControls 
          activeAxes={[false, true, true]} 
          rotation={[0, Math.PI, 0]} 
          scale={1} 
          anchor={[0.4, 0, 0]} 
          onDrag={handleCsgUpdate}
        >
          <Window rotation={[0, Math.PI / 2, 0]} position={[1.425, 0.25, 0]} scale={1.25} />
        </PivotControls>
        
        <PivotControls 
          activeAxes={[false, true, true]} 
          scale={1} 
          anchor={[-0.5, 0, 0]} 
          onDrag={handleCsgUpdate}
        >
          <Door rotation={[0, Math.PI / 2, 0]} position={[-1.425, -0.45, 0]} scale={[1, 0.9, 1]} />
        </PivotControls>
      </Geometry>
      <meshStandardMaterial envMapIntensity={0.25} />
    </mesh>
  )
}

function Door(props) {
  return (
    <Subtraction {...props}>
      <Geometry>
        <Base geometry={boxGeometry} scale={[1, 2, 1]} />
        <Addition 
          geometry={cylinderGeometry} 
          scale={0.5} 
          rotation={[Math.PI / 2, 0, 0]} 
          position={[0, 1, 0]} 
        />
      </Geometry>
    </Subtraction>
  )
}

function Window(props) {
  return (
    <Subtraction {...props}>
      <Geometry>
        <Base geometry={boxGeometry} />
        <Subtraction geometry={boxGeometry} scale={[0.05, 1, 1]} />
        <Subtraction geometry={boxGeometry} scale={[1, 0.05, 1]} />
      </Geometry>
    </Subtraction>
  )
}

function Chimney(props) {
  return (
    <Addition {...props}>
      <Geometry>
        <Base geometry={boxGeometry} scale={[1, 2, 1]} />
        <Subtraction 
          geometry={boxGeometry} 
          scale={[0.7, 2, 0.7]} 
          position={[0, 0.5, 0]} 
        />
      </Geometry>
    </Addition>
  )
}
