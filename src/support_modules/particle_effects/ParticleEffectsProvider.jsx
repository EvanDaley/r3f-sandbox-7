import { createContext, useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import effectCatalog from './effectCatalog';
import ParticleEffectsRenderer from './ParticleEffectsRenderer';

const ParticleEffectsContext = createContext(null);

const clonePosition = (positionLike) => {
  if (positionLike instanceof THREE.Vector3) {
    return positionLike.clone();
  }

  if (Array.isArray(positionLike)) {
    return new THREE.Vector3(positionLike[0] ?? 0, positionLike[1] ?? 0, positionLike[2] ?? 0);
  }

  return new THREE.Vector3(0, 0, 0);
};

export default function ParticleEffectsProvider({ children }) {
  const particlesRef = useRef([]);

  const triggerEffect = useCallback((effectId, context = {}) => {
    const factory = effectCatalog[effectId];
    if (!factory) {
      return;
    }

    const particles = factory({
      ...context,
      position: clonePosition(context.position),
    });

    if (Array.isArray(particles) && particles.length > 0) {
      particlesRef.current.push(...particles);
    }
  }, []);

  const value = useMemo(() => ({ triggerEffect }), [triggerEffect]);

  return (
    <ParticleEffectsContext.Provider value={value}>
      {children}
      <ParticleEffectsRenderer particlesRef={particlesRef} />
    </ParticleEffectsContext.Provider>
  );
}

export { ParticleEffectsContext };
