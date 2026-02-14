import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { ContactShadows, OrbitControls, Environment } from "@react-three/drei"
import { usePaletteStore } from "../dynamic_colors/stores/paletteStore"
import { usePaletteMeshes } from "../dynamic_colors/hooks/usePaletteMeshes"
import * as THREE from "three"
import EffectsV2 from "../../components/effects/EffectsV2"

export default function BullpupConfigurator1() {
  const activePalette = usePaletteStore((s) => s.activePalette)

  return (
    <>
      <EffectsV2 />
      {/* <GradientBackground />Vgc */}
      <perspectiveCamera makeDefault />
      <ambientLight intensity={1.0} />
      {/* <spotLight intensity={2.0} angle={0.1} penumbra={1} position={[10, 15, 10]} castShadow />
      <directionalLight intensity={1.5} position={[-10, 10, 5]} castShadow />
      <pointLight intensity={1.0} position={[0, 10, -10]} />
      <directionalLight intensity={1.0} position={[5, 5, 10]} /> */}
      <Bullpup materials={activePalette} />
      <Environment preset="city" intensity={0.001}/>
      <ContactShadows position={[0, -0.8, 0]} opacity={0.3} scale={20} blur={2} far={2} />

      <OrbitControls
        enableZoom={true}
        enablePan={true}
      />
    </>
  )
}

function GradientBackground() {
  return (
    <mesh scale={[500, 500, 500]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        uniforms={{
          topColor: { value: new THREE.Color(0xf0f0f5) },
          bottomColor: { value: new THREE.Color(0xd0d0d5) },
          offset: { value: 0.5 },
          exponent: { value: 0.6 }
        }}
        vertexShader={`
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition).y;
            float factor = pow(max(h + offset, 0.0), exponent);
            gl_FragColor = vec4(mix(bottomColor, topColor, factor), 1.0);
          }
        `}
        side={THREE.BackSide}
      />
    </mesh>
  )
}

function Bullpup({ materials }) {
  const ref = useRef()
  const MODEL_PATH = "configurator/christmas-bullpup.glb"
  // const MODEL_PATH = "configurator/christmas-bullpup-palette.glb"
  const { meshes } = usePaletteMeshes(MODEL_PATH, materials)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    ref.current.position.y = (1 + Math.sin(t / 1.5)) / 10
  })

  if (!meshes?.length) return null

  return (
    <group
      rotation={[0, Math.PI, 0]}
      ref={ref}
    >
      {meshes.map((mesh) => (
        <mesh
          key={mesh.uuid}
          geometry={mesh.geometry}
          material={mesh.material}
          position={mesh.position}
          rotation={mesh.rotation}
          scale={mesh.scale}
          receiveShadow
          castShadow
        />
      ))}
    </group>
  )
}

