import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import * as THREE from "three";

/**
 * Hook to respawn the player when they fall below a certain Y position
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.fallThreshold - Y position below which to respawn (default: -10)
 * @param {THREE.Vector3|Array} options.spawnPosition - Position to respawn at (default: [0, 5, 0])
 * @param {string} options.characterColliderName - Name of the character's collider to find (default: "character-capsule-collider")
 */
export function useRespawnOnFall(options = {}) {
  const {
    fallThreshold = -10,
    spawnPosition = [0, 5, 0],
    characterColliderName = "character-capsule-collider",
  } = options;

  const { world } = useRapier();
  const characterBodyRef = useRef(null);
  const spawnPos = useRef(
    spawnPosition instanceof THREE.Vector3
      ? spawnPosition
      : new THREE.Vector3(...spawnPosition)
  );

  // Find the character RigidBody by collider name
  useEffect(() => {
    if (!world) return;

    // Function to find character body
    const findCharacterBody = () => {
      // Search through all colliders to find the character
      for (let i = 0; i < world.colliders.len(); i++) {
        const collider = world.colliders.get(i);
        if (collider && collider.name() === characterColliderName) {
          const body = collider.parent();
          if (body) {
            characterBodyRef.current = body;
            return;
          }
        }
      }
    };

    // Try to find immediately
    findCharacterBody();

    // Also try after a short delay in case character hasn't loaded yet
    const timeout = setTimeout(findCharacterBody, 100);

    return () => clearTimeout(timeout);
  }, [world, characterColliderName]);

  // Check position and respawn if needed
  useFrame(() => {
    if (!characterBodyRef.current) return;

    const translation = characterBodyRef.current.translation();
    
    if (translation.y < fallThreshold) {
      // Reset position to spawn
      characterBodyRef.current.setTranslation(
        {
          x: spawnPos.current.x,
          y: spawnPos.current.y,
          z: spawnPos.current.z,
        },
        true // wake up the body
      );
      
      // Reset velocity to prevent falling immediately
      characterBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });
}
