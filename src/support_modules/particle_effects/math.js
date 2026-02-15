import * as THREE from 'three';

export const randomRange = (min, max) => min + Math.random() * (max - min);

export const randomDirection = () => {
  const direction = new THREE.Vector3(
    randomRange(-1, 1),
    randomRange(-1, 1),
    randomRange(-1, 1)
  );

  if (direction.lengthSq() < 1e-5) {
    direction.set(0, 1, 0);
  }

  return direction.normalize();
};

export const randomDirectionUpward = () => {
  const direction = randomDirection();
  direction.y = Math.abs(direction.y) + 0.2;
  return direction.normalize();
};

export const withSpread = (origin, spread = 0) => {
  const vector = origin.clone();

  if (spread > 0) {
    vector.x += randomRange(-spread, spread);
    vector.y += randomRange(-spread * 0.35, spread * 0.75);
    vector.z += randomRange(-spread, spread);
  }

  return vector;
};
