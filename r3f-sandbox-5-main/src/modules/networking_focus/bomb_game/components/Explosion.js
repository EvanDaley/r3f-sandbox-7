import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 500;
const EXPLOSION_DURATION = 2.0; // seconds
const EXPLOSION_SPEED = 60; // units per second

export default function Explosion({ position }) {
  const meshRef = useRef();
  const elapsedTime = useRef(0);
  const isActive = useRef(true);
  const velocitiesRef = useRef(null);
  const colorsRef = useRef(null);

  // Create particle geometry and positions
  const { positions, velocities, colors } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Random direction for each particle
      const angle = Math.random() * Math.PI * 2;
      const elevation = (Math.random() - 0.5) * Math.PI;
      const speed = 0.8 + Math.random() * 1.2; // Random speed variation (larger spread)
      
      // Start at origin
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;
      
      // Velocity vector
      velocities[i3] = Math.cos(angle) * Math.cos(elevation) * speed;
      velocities[i3 + 1] = Math.sin(elevation) * speed;
      velocities[i3 + 2] = Math.sin(angle) * Math.cos(elevation) * speed;
      
      // Color: orange to red gradient
      const colorMix = Math.random();
      colors[i3] = 1; // Red
      colors[i3 + 1] = 0.3 + colorMix * 0.4; // Orange to yellow
      colors[i3 + 2] = 0; // No blue
    }

    velocitiesRef.current = velocities;
    colorsRef.current = colors;
    return { positions, velocities, colors };
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current || !isActive.current) return;

    elapsedTime.current += delta;

    if (elapsedTime.current >= EXPLOSION_DURATION) {
      isActive.current = false;
      return;
    }

    // Update particle positions
    const positionArray = meshRef.current.geometry.attributes.position.array;
    const colorArray = meshRef.current.geometry.attributes.color.array;
    const velocities = velocitiesRef.current;
    const colors = colorsRef.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      
      // Update position based on velocity
      positionArray[i3] += velocities[i3] * EXPLOSION_SPEED * delta;
      positionArray[i3 + 1] += velocities[i3 + 1] * EXPLOSION_SPEED * delta;
      positionArray[i3 + 2] += velocities[i3 + 2] * EXPLOSION_SPEED * delta;
      
      // Apply gravity
      velocities[i3 + 1] -= 9.8 * delta; // Gravity
      
      // Fade out over time
      const fade = 1 - (elapsedTime.current / EXPLOSION_DURATION);
      colorArray[i3] = colors[i3] * fade;
      colorArray[i3 + 1] = colors[i3 + 1] * fade;
      colorArray[i3 + 2] = colors[i3 + 2] * fade;
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.geometry.attributes.color.needsUpdate = true;
  });

  if (!isActive.current) return null;

  return (
    <points ref={meshRef} position={[position.x, position.y, position.z]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        vertexColors={true}
        transparent={true}
        opacity={1}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
}

