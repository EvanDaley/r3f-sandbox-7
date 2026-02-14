import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Component that draws a visual connection between a player and a bomb
 */
export default function BombConnection({ from, to, color = "#ff4400" }) {
  const lineRef = useRef();
  const timeRef = useRef(0);

  // Create geometry for the connection line
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(6); // 2 points * 3 coordinates
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,
      linewidth: 2,
    });
  }, [color]);

  useFrame((_, delta) => {
    if (!lineRef.current || !from || !to) return;

    timeRef.current += delta;

    // Update line positions
    const positions = geometry.attributes.position.array;
    positions[0] = from.x;
    positions[1] = from.y + 1; // Offset from player center (roughly at chest/head level)
    positions[2] = from.z;
    positions[3] = to.x;
    positions[4] = to.y;
    positions[5] = to.z;

    geometry.attributes.position.needsUpdate = true;

    // Animate opacity with a pulsing effect
    const pulse = Math.sin(timeRef.current * 3) * 0.2 + 0.8;
    material.opacity = 0.4 + pulse * 0.3;
  });

  if (!from || !to) return null;

  return (
    <line ref={lineRef}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </line>
  );
}

