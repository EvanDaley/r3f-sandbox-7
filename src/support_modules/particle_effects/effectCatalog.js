import * as THREE from 'three';
import { randomDirectionUpward, randomRange, withSpread } from './math';

const COLOR = Object.freeze({
  levelGlow: new THREE.Color('#fef08a'),
  levelCore: new THREE.Color('#f97316'),
  levelSpark: new THREE.Color('#60a5fa'),
  woodcutting: new THREE.Color('#22c55e'),
  mining: new THREE.Color('#f59e0b'),
  combat: new THREE.Color('#ef4444'),
  crafting: new THREE.Color('#c084fc'),
  fallback: new THREE.Color('#a78bfa'),
});

const makeParticle = ({ position, velocity, color, life, size, drag = 0.96, gravity = 1.2 }) => ({
  position,
  velocity,
  color,
  life,
  maxLife: life,
  size,
  drag,
  gravity,
});

const spawnRing = ({ origin, count, radius, color, upwardBoost = 2.2, size = 0.14 }) => {
  const particles = [];

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));

    particles.push(
      makeParticle({
        position: withSpread(origin, 0.08),
        velocity: direction.multiplyScalar(radius).add(new THREE.Vector3(0, upwardBoost, 0)),
        color,
        life: randomRange(0.65, 1.15),
        size: randomRange(size * 0.75, size * 1.25),
        drag: 0.94,
      })
    );
  }

  return particles;
};

const spawnBurst = ({ origin, count, speed, color, spread = 0.28, life = [0.4, 0.9], size = [0.06, 0.12] }) => {
  const particles = [];

  for (let i = 0; i < count; i += 1) {
    const direction = randomDirectionUpward();
    const magnitude = randomRange(speed.min, speed.max);

    particles.push(
      makeParticle({
        position: withSpread(origin, spread),
        velocity: direction.multiplyScalar(magnitude),
        color,
        life: randomRange(life[0], life[1]),
        size: randomRange(size[0], size[1]),
      })
    );
  }

  return particles;
};

const resolveTrainingColor = (skillId) => COLOR[skillId] ?? COLOR.fallback;

const catalog = {
  LEVEL_UP: ({ position, levelUps = 1 }) => {
    const origin = position.clone().add(new THREE.Vector3(0, 0.9, 0));
    const tier = Math.min(4, Math.max(1, levelUps));

    return [
      ...spawnRing({
        origin,
        count: 18 + tier * 6,
        radius: 2.6 + tier * 0.25,
        color: COLOR.levelGlow,
        upwardBoost: 2.4,
        size: 0.18,
      }),
      ...spawnBurst({
        origin,
        count: 20 + tier * 8,
        speed: { min: 2.3, max: 4.7 },
        color: COLOR.levelCore,
        spread: 0.2,
        life: [0.7, 1.4],
        size: [0.08, 0.22],
      }),
      ...spawnBurst({
        origin,
        count: 24 + tier * 10,
        speed: { min: 1.8, max: 3.4 },
        color: COLOR.levelSpark,
        spread: 0.6,
        life: [0.5, 1.05],
        size: [0.06, 0.14],
      }),
    ];
  },
  TRAINING_ACTION: ({ position, skillId }) => {
    const origin = position.clone().add(new THREE.Vector3(0, 0.75, 0));
    const color = resolveTrainingColor(skillId);

    return [
      ...spawnBurst({
        origin,
        count: 26,
        speed: { min: 1.1, max: 3.1 },
        color,
        spread: 0.22,
        life: [0.24, 0.58],
        size: [0.05, 0.12],
      }),
      ...spawnRing({
        origin,
        count: 14,
        radius: 1.2,
        color,
        upwardBoost: 1.2,
        size: 0.08,
      }),
    ];
  },
};

export default catalog;
