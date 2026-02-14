import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import useRpg2ProgressionStore from '../stores/useRpg2ProgressionStore';

const INTERACTION_RANGE = 2.2;
const ACTION_COOLDOWN = 0.45;
const RUNNING_XP_PER_SECOND = 5.5;
const MIN_RUNNING_SPEED = 0.25;

export default function ProgressionSystem({ controllerRef, trainingStations, inputRef }) {
  const lastActionAt = useRef(0);
  const playerPosition = useMemo(() => new THREE.Vector3(), []);
  const addExperience = useRpg2ProgressionStore((state) => state.addExperience);

  useFrame((_, delta) => {
    const rigidBody = controllerRef.current?.group;
    if (!rigidBody) {
      return;
    }

    const translation = rigidBody.translation();
    playerPosition.set(translation.x, translation.y, translation.z);

    const velocity = rigidBody.linvel();
    const horizontalSpeed = Math.hypot(velocity.x, velocity.z);
    if (horizontalSpeed > MIN_RUNNING_SPEED) {
      addExperience('running', delta * RUNNING_XP_PER_SECOND, 'movement');
    }

    const canInteract = inputRef.current.interact && performance.now() - lastActionAt.current > ACTION_COOLDOWN * 1000;
    if (!canInteract) {
      return;
    }

    const nearestStation = trainingStations.find(
      (station) => playerPosition.distanceTo(station.vector) <= INTERACTION_RANGE
    );

    if (!nearestStation) {
      return;
    }

    addExperience(nearestStation.skillId, nearestStation.xp, nearestStation.name);
    lastActionAt.current = performance.now();
  });

  return null;
}
