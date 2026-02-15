# Particle Effects Support Module

This module is built for long-term scale and extension.

## Architecture

- `ParticleEffectsProvider.jsx`: owns particle state and exposes `triggerEffect(effectId, context)`.
- `effectCatalog.js`: registry of effect factories. Add new effects by adding new keys here.
- `ParticleEffectsRenderer.jsx`: high-performance renderer that updates particles in a single point cloud.
- `useParticleEffects.js`: hook for scene systems to trigger effects without coupling to renderer internals.
- `math.js`: reusable randomization helpers.

## Usage

Wrap your scene once:

```jsx
<ParticleEffectsProvider>
  <YourScene />
</ParticleEffectsProvider>
```

Trigger from any child component:

```js
const { triggerEffect } = useParticleEffects();
triggerEffect('TRAINING_ACTION', { position, skillId: 'combat' });
triggerEffect('LEVEL_UP', { position, levelUps: 1 });
```

## Extending

1. Add a new factory in `effectCatalog.js`.
2. Emit it from gameplay systems via `triggerEffect('YOUR_EFFECT', payload)`.
3. Keep payload shape explicit and domain-aligned.
