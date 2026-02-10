import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Hook to animate platform objects vertically (up and down) using kinematic RigidBodies
 * Moves platforms up and down along the Y-axis
 * 
 * @param {Array} platforms - Array of platform data objects with:
 *   - object: THREE.Object3D (the visual object)
 *   - startPos: THREE.Vector3 (initial position)
 *   - id: string (unique identifier)
 *   - phase: number (0-1, phase offset to start at different positions in cycle)
 * @param {React.MutableRefObject<Map>} platformRefsRef - Map storing RigidBody refs by platform id
 * @param {Object} options - Animation options
 * @param {number} options.moveDistance - Distance to move in each direction (default: 5)
 * @param {number} options.moveSpeed - Speed of movement (default: 2)
 */
export function useAnimateVerticalPlatform(platforms, platformRefsRef, options = {}) {
  const platformsDataRef = useRef(new Map());
  const { moveDistance = 5, moveSpeed = 2 } = options;

  // Initialize platform data with phase offset
  useEffect(() => {
    if (!platforms || platforms.length === 0) return;

    platformsDataRef.current.clear();
    platforms.forEach((platformData) => {
      const phase = platformData.phase || 0; // Phase offset (0-1)
      
      // Calculate initial position based on phase
      // Phase 0 = at startPos, phase 0.5 = at end, phase 1 = back at start
      let initialOffsetY = 0;
      let initialDirection = 1;
      
      if (phase < 0.5) {
        // First half: moving up from start
        initialOffsetY = (phase / 0.5) * moveDistance;
        initialDirection = 1;
      } else {
        // Second half: moving down from end
        initialOffsetY = moveDistance - ((phase - 0.5) / 0.5) * (moveDistance * 2);
        initialDirection = -1;
      }
      
      platformsDataRef.current.set(platformData.id, {
        currentY: platformData.startPos.y + initialOffsetY,
        direction: initialDirection,
      });
    });
  }, [platforms, moveDistance]);

  // Animate all platforms using kinematic translation
  useFrame((state, delta) => {
    if (!platforms || platforms.length === 0) return;

    // Clamp delta to prevent large jumps when tab regains focus
    // This prevents platforms from jumping when you switch back to the tab
    if (delta > 0.1) delta = 0.1;

    platforms.forEach((platformData) => {
      const data = platformsDataRef.current.get(platformData.id);
      const rigidBodyRef = platformRefsRef.current.get(platformData.id);
      
      if (!data || !rigidBodyRef) return;

      const startPos = platformData.startPos;
      const direction = data.direction;

      // Calculate new position
      data.currentY += moveSpeed * delta * direction;

      // Check if we've reached the limits and reverse direction
      const distanceFromStart = data.currentY - startPos.y;
      if (distanceFromStart >= moveDistance) {
        data.direction = -1;
        data.currentY = startPos.y + moveDistance;
      } else if (distanceFromStart <= -moveDistance) {
        data.direction = 1;
        data.currentY = startPos.y - moveDistance;
      }

      // Update the kinematic rigid body position
      rigidBodyRef.setNextKinematicTranslation({
        x: startPos.x,
        y: data.currentY,
        z: startPos.z,
      });
    });
  });
}
