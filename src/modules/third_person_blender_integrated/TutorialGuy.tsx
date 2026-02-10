import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

/**
 * TutorialGuy Component
 * 
 * Tutorial character component.
 * Currently uses the same model as the player character.
 */
export default function TutorialGuy({ position }: { position: [number, number, number] }) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("./models/third_person_blender_integrated/tutorial-guy-1.glb");

  // Ensure position is set correctly
  useEffect(() => {
    if (group.current) {
      group.current.position.set(position[0], position[1], position[2]);
      console.log("TutorialGuy position set to:", position);
    }
  }, [position]);

  return (
    <Suspense fallback={null}>
      <group ref={group} position={position} dispose={null} userData={{ isTutorialGuy: true }}>
        <primitive object={scene.clone()} />
      </group>
    </Suspense>
  );
}

// Preload the tutorial-guy model
useGLTF.preload("./models/third_person_blender_integrated/tutorial-guy-1.glb");

