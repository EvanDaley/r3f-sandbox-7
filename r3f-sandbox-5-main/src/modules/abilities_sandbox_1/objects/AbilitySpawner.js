import * as THREE from "three"
import React, { useRef, useState } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useAbilityStore } from "../stores/abilityStore"

export default function AbilitySpawner() {
  const { getSelectedAbility, castAbility } = useAbilityStore()
  const [activeAbilities, setActiveAbilities] = useState([])
  const [isPointerDown, setIsPointerDown] = useState(false)
  const planeRef = useRef()

  const { camera, mouse } = useThree()
  const raycaster = useRef(new THREE.Raycaster())

  const lastCastTime = useRef(0)
  const castInterval = 10

  const handlePointerDown = (e) => {
    e.stopPropagation()
    setIsPointerDown(true)
    spawnAbility(e.point)
  }

  const handlePointerUp = () => {
    setIsPointerDown(false)
  }

  const spawnAbility = (point) => {
    const ability = getSelectedAbility()
    if (!ability || ability.charge < 1) return

    setActiveAbilities((prev) => [
      ...prev,
      {
        id: Math.random(),
        emoji: ability.emoji,
        position: point.clone(),
        createdAt: performance.now(),
      },
    ])

    castAbility(ability.id)
  }

  useFrame(() => {
    const now = performance.now()

    // fire repeatedly while held
    if (isPointerDown && now - lastCastTime.current > castInterval) {
      const ability = getSelectedAbility()
      if (ability && ability.charge >= 1 && planeRef.current) {
        // raycast from mouse to plane
        raycaster.current.setFromCamera(mouse, camera)
        const hits = raycaster.current.intersectObject(planeRef.current)
        if (hits.length > 0) {
          spawnAbility(hits[0].point)
          lastCastTime.current = now
        }
      }
    }

    // update and fade active abilities
    setActiveAbilities((prev) =>
      prev
        .map((s) => ({
          ...s,
          position: s.position.clone().add(new THREE.Vector3(0, 0.01, 0)),
          life: (now - s.createdAt) / 1000,
        }))
        .filter((s) => s.life < 2)
    )
  })

  return (
    <>
      {/* Invisible ground plane */}
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Render active ability objects */}
      {activeAbilities.map((ability) => (
        <mesh
          key={ability.id}
          position={ability.position}
          scale={1 + Math.sin(ability.life * Math.PI) * 0.2}
        >
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial
            emissive={"#ff9933"}
            emissiveIntensity={2}
            color={"#ffaa55"}
            transparent
            opacity={1 - ability.life / 2}
          />
        </mesh>
      ))}
    </>
  )
}
