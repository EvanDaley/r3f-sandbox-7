import { useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

function Box(props) {
  const ref = useRef()
  const [hovered, hover] = useState(false)
  return (
    <mesh {...props} castShadow ref={ref} onPointerOver={(event) => hover(true)} onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

function Shadows(props) {
  const { viewport } = useThree()
  return (
    <mesh
      receiveShadow
      scale={[viewport.width, viewport.height, 1]}
      rotation={[-Math.PI / 2, 0, 0]}
      {...props}
    >
      <planeGeometry />
      <meshStandardMaterial color="#c2e7fa" />
    </mesh>
  )
}

export default function AtlantisText() {
  return (
    <>
      <color attach="background" args={['#f0f0f0']} />
      <PerspectiveCamera makeDefault position={[0, 0, 4]} />
      <OrbitControls/>
      <ambientLight intensity={1} />
      <spotLight position={[12, 20, 20]} angle={0.15} penumbra={1} castShadow shadow-mapSize={[2024, 2024]} intensity={15} target-position={[0, 0, 0]} />
      <pointLight position={[10, 0, 0]} intensity={15} />
      <Box position={[-1.2, 0.5, 0]} />
      <Box position={[1.2, 0.5, 0]} />
      <Shadows position={[0, 0, -0.5]} />
    </>
  )
}
