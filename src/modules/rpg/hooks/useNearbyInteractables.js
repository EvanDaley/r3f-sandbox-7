import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

export const INTERACTION_RANGE = 2.2;

export default function useNearbyInteractables({ controllerRef, interactables, range = INTERACTION_RANGE }) {
  const [nearbyInteractableIds, setNearbyInteractableIds] = useState(() => new Set());
  const playerPosition = useMemo(() => new THREE.Vector3(), []);
  const nearbyRef = useRef(new Set());

  useFrame(() => {
    const rigidBody = controllerRef.current?.group;
    if (!rigidBody) {
      return;
    }

    const translation = rigidBody.translation();
    playerPosition.set(translation.x, translation.y, translation.z);

    const nextNearby = new Set();
    const rangeSquared = range * range;

    for (let i = 0; i < interactables.length; i += 1) {
      const station = interactables[i];
      if (playerPosition.distanceToSquared(station.vector) <= rangeSquared) {
        nextNearby.add(station.id);
      }
    }

    const previousNearby = nearbyRef.current;
    let hasChanged = nextNearby.size !== previousNearby.size;

    if (!hasChanged) {
      for (const stationId of nextNearby) {
        if (!previousNearby.has(stationId)) {
          hasChanged = true;
          break;
        }
      }
    }

    if (!hasChanged) {
      return;
    }

    nearbyRef.current = nextNearby;
    setNearbyInteractableIds(nextNearby);
  });

  return nearbyInteractableIds;
}
