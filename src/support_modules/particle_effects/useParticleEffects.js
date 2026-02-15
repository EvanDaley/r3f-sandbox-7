import { useContext } from 'react';
import { ParticleEffectsContext } from './ParticleEffectsProvider';

export default function useParticleEffects() {
  const context = useContext(ParticleEffectsContext);

  if (!context) {
    return {
      triggerEffect: () => {},
    };
  }

  return context;
}
