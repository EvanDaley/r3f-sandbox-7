import { useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, ContactShadows, Environment, OrbitControls } from "@react-three/drei"
import { proxy, useSnapshot } from "valtio"

export const state = proxy({
  current: null,
  items: { laces: "#fff", mesh: "#fff", caps: "#fff", inner: "#fff", sole: "#fff", stripes: "#fff", band: "#fff", patch: "#fff" },
})

export default function ItemConfigurator1() {
  return (
    <>
        <color attach="background" args={["#ffffff"]} />


      {/* <perspectiveCamera makeDefault position={[0, 0, 4]} fov={45} /> */}
      <perspectiveCamera makeDefault />
      <ambientLight intensity={0.7} />
      <spotLight intensity={0.5} angle={0.1} penumbra={1} position={[10, 15, 10]} castShadow />
      <Shoe />
      <Environment preset="city" />
      <ContactShadows position={[0, -0.8, 0]} opacity={0.25} scale={10} blur={1.5} far={0.8} />

      <OrbitControls
        enableZoom={true}
        enablePan={true}
      />
    </>
  )
}

function Shoe() {
  const ref = useRef()
  const snap = useSnapshot(state)
  const MODEL_PATH = window.location.href + "/models/configurator/foot.glb"
  const { nodes, materials } = useGLTF(MODEL_PATH)
  const [hovered, set] = useState(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // ref.current.rotation.set(Math.cos(t / 4) / 8, Math.sin(t / 4) / 8, -0.2 - (1 + Math.sin(t / 1.5)) / 20)
    ref.current.position.y = (1 + Math.sin(t / 1.5)) / 10
  })

  useEffect(() => {
    const cursor = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><g filter="url(#filter0_d)"><path d="M29.5 47C39.165 47 47 39.165 47 29.5S39.165 12 29.5 12 12 19.835 12 29.5 19.835 47 29.5 47z" fill="${snap.items[hovered]}"/></g><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/><text fill="#000" style="#fff-space:pre" font-family="Inter var, sans-serif" font-size="10" letter-spacing="-.01em"><tspan x="35" y="63">${hovered}</tspan></text></g><defs><clipPath id="clip0"><path fill="#fff" d="M0 0h64v64H0z"/></clipPath><filter id="filter0_d" x="6" y="8" width="47" height="47" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="2"/><feGaussianBlur stdDeviation="3"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow"/><feBlend in="SourceGraphic" in2="effect1_dropShadow" result="shape"/></filter></defs></svg>`
    const auto = `<svg width="64" height="64" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="rgba(255, 255, 255, 0.5)" d="M29.5 54C43.031 54 54 43.031 54 29.5S43.031 5 29.5 5 5 15.969 5 29.5 15.969 54 29.5 54z" stroke="#000"/><path d="M2 2l11 2.947L4.947 13 2 2z" fill="#000"/></svg>`
    if (hovered) {
      document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(cursor)}'), auto`
      return () => (document.body.style.cursor = `url('data:image/svg+xml;base64,${btoa(auto)}'), auto`)
    }
  }, [hovered])

  return (
    <group
      ref={ref}
      onPointerOver={(e) => (e.stopPropagation(), set(e.object.material.name))}
      onPointerOut={(e) => e.intersections.length === 0 && set(null)}
      onPointerMissed={() => (state.current = null)}
      onClick={(e) => (e.stopPropagation(), (state.current = e.object.material.name))}>
      {Object.values(nodes).map((node, index) => {
        if (!node.geometry) return null
        const materialName = node.material?.name || Object.keys(materials)[index]
        const material = materials[materialName]
        if (!material) return null
        
        return (
          <mesh
            key={node.uuid || index}
            receiveShadow
            castShadow
            geometry={node.geometry}
            material={material}
            material-color={snap.items[materialName] || "#fff"}
          />
        )
      })}
    </group>
  )
}

