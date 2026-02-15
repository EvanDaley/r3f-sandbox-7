import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const MAX_PARTICLES = 4000;

export default function ParticleEffectsRenderer({ particlesRef }) {
  const pointsRef = useRef();

  const geometry = useMemo(() => {
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3));
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3));
    particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(new Float32Array(MAX_PARTICLES), 1));
    particleGeometry.setDrawRange(0, 0);
    return particleGeometry;
  }, []);

  useFrame((_, delta) => {
    const particles = particlesRef.current;
    if (!pointsRef.current || !particles) {
      return;
    }

    let writeIndex = 0;
    const pos = geometry.attributes.position.array;
    const color = geometry.attributes.color.array;
    const size = geometry.attributes.size.array;

    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      particle.life -= delta;

      if (particle.life <= 0 || writeIndex >= MAX_PARTICLES) {
        particles.splice(i, 1);
        continue;
      }

      particle.velocity.y -= particle.gravity * delta;
      particle.velocity.multiplyScalar(Math.pow(particle.drag, delta * 60));
      particle.position.addScaledVector(particle.velocity, delta);

      const alpha = particle.life / particle.maxLife;
      const idx = writeIndex * 3;
      pos[idx] = particle.position.x;
      pos[idx + 1] = particle.position.y;
      pos[idx + 2] = particle.position.z;
      color[idx] = particle.color.r * alpha;
      color[idx + 1] = particle.color.g * alpha;
      color[idx + 2] = particle.color.b * alpha;
      size[writeIndex] = particle.size * (0.5 + alpha);
      writeIndex += 1;
    }

    geometry.setDrawRange(0, writeIndex);
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false} renderOrder={1000}>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors
        uniforms={{ uPixelRatio: { value: Math.min(window.devicePixelRatio ?? 1, 2) } }}
        vertexShader={`
          attribute float size;
          varying vec3 vColor;

          uniform float uPixelRatio;

          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * 110.0 * uPixelRatio * (1.0 / max(0.001, -mvPosition.z));
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying vec3 vColor;

          void main() {
            float dist = distance(gl_PointCoord, vec2(0.5));
            float strength = smoothstep(0.5, 0.0, dist);
            gl_FragColor = vec4(vColor, strength);
          }
        `}
      />
    </points>
  );
}
