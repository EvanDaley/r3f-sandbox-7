import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGame } from '@/modules/third_person_controller/stores/useGame';
import useRpgProgressionStore from '../stores/useRpgProgressionStore';
import { INTERACTION_RANGE } from '../hooks/useNearbyInteractables';
import { useParticleEffects } from '@/support_modules/particle_effects';

const ACTION_COOLDOWN = 0.45;
const RUNNING_XP_PER_SECOND = 27.5;
const MIN_RUNNING_SPEED = 0.25;

const INTERACTION_ANIMATION_BY_SKILL = Object.freeze({
  woodcutting: 'action4',
  mining: 'action4',
  combat: 'action4',
  crafting: 'action2',
});

export default function ProgressionSystem({ controllerRef, trainingStations, inputRef, nearbyInteractableIds }) {
  const lastActionAt = useRef(0);
  const playerPosition = useMemo(() => new THREE.Vector3(), []);
  const addExperience = useRpgProgressionStore((state) => state.addExperience);
  const lastExperienceEvent = useRpgProgressionStore((state) => state.lastExperienceEvent);
  const animationSet = useGame((state) => state.animationSet);
  const triggerAction2Animation = useGame((state) => state.action2);
  const triggerAction4Animation = useGame((state) => state.action4);
  const { triggerEffect } = useParticleEffects();

  useEffect(() => {
    if (!lastExperienceEvent || !lastExperienceEvent.position) {
      return;
    }

    if (lastExperienceEvent.source !== 'movement') {
      triggerEffect('TRAINING_ACTION', {
        position: lastExperienceEvent.position,
        skillId: lastExperienceEvent.skillId,
      });
    }

    if (lastExperienceEvent.levelsGained > 0) {
      triggerEffect('LEVEL_UP', {
        position: lastExperienceEvent.position,
        levelUps: lastExperienceEvent.levelsGained,
      });
    }
  }, [lastExperienceEvent, triggerEffect]);

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
      addExperience('running', delta * RUNNING_XP_PER_SECOND, 'movement', {
        position: [playerPosition.x, playerPosition.y, playerPosition.z],
      });
    }

    const canInteract = inputRef.current.interact && performance.now() - lastActionAt.current > ACTION_COOLDOWN * 1000;
    if (!canInteract || nearbyInteractableIds.size === 0) {
      return;
    }

    let nearestStation = null;
    let nearestDistanceSquared = INTERACTION_RANGE * INTERACTION_RANGE;

    for (let i = 0; i < trainingStations.length; i += 1) {
      const station = trainingStations[i];
      if (!nearbyInteractableIds.has(station.id)) {
        continue;
      }

      const distanceSquared = playerPosition.distanceToSquared(station.vector);
      if (distanceSquared <= nearestDistanceSquared) {
        nearestDistanceSquared = distanceSquared;
        nearestStation = station;
      }
    }

    if (!nearestStation) {
      return;
    }

    addExperience(nearestStation.skillId, nearestStation.xp, nearestStation.name, {
      position: [playerPosition.x, playerPosition.y, playerPosition.z],
    });

    const interactionAnimation = INTERACTION_ANIMATION_BY_SKILL[nearestStation.skillId];
    if (interactionAnimation === 'action4' && animationSet.action4) {
      triggerAction4Animation();
    }

    if (interactionAnimation === 'action2' && animationSet.action2) {
      triggerAction2Animation();
    }
    lastActionAt.current = performance.now();
  });

  return null;
}
