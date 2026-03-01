import { useGLTF, useAnimations, Text } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Robot Component
 * 
 * Loads a robot GLB model and cycles through animations.
 * Displays the current animation name above the robot.
 * 
 * Animation names expected in the GLB file:
 * - Idle
 * - Walk
 * - Run
 * - Jump
 * - Attack
 * - Wave
 * - Dance
 * - PowerUp
 * - Scan
 * - Repair
 * - Defend
 * - Victory
 * - Damage
 */
export default function Robot({ 
  position = [0, 0, 0], 
  scale = 1,
  modelPath = "./models/robots/robot.glb",
  autoCycle = true,
  cycleInterval = 3000 // milliseconds
}) {
  const groupRef = useRef();
  const { scene, animations } = useGLTF(modelPath);
  const { actions, mixer } = useAnimations(animations, groupRef);
  
  const [currentAnimation, setCurrentAnimation] = useState(null);
  const [animationIndex, setAnimationIndex] = useState(0);
  const lastCycleTime = useRef(0);

  // Define the animation names that should be available in the GLB
  const animationNames = [
    "Idle",
    "Walk",
    "Run",
    "Jump",
    "Attack",
    "Wave",
    "Dance",
    "PowerUp",
    "Scan",
    "Repair",
    "Defend",
    "Victory",
    "Damage"
  ];

  // Store available animations in a ref so useFrame can access it
  const availableAnimationsRef = useRef([]);

  useEffect(() => {
    if (!animations || animations.length === 0) {
      console.log("No animations found in robot GLB");
      return;
    }

    // Filter to only animations that exist in the model
    const availableAnimations = animationNames.filter(name => 
      actions[name] !== undefined
    );
    
    availableAnimationsRef.current = availableAnimations;

    console.log("Robot animations found:", animations.map(a => a.name));
    console.log("Available robot animations:", availableAnimations);

    // Start with the first available animation
    if (availableAnimations.length > 0) {
      const firstAnim = availableAnimations[0];
      setCurrentAnimation(firstAnim);
      const action = actions[firstAnim];
      if (action) {
        action.reset().fadeIn(0.5).play();
        action.setLoop(THREE.LoopRepeat, Infinity);
      }
    }

    // Cleanup on unmount
    return () => {
      Object.values(actions).forEach((action) => {
        if (action) {
          action.fadeOut(0.5);
        }
      });
    };
  }, [animations, actions]);

  // Auto-cycle through animations
  useFrame((state, delta) => {
    // Update animation mixer
    if (mixer) {
      mixer.update(delta);
    }

    // Auto-cycle animations
    const availableAnimations = availableAnimationsRef.current;
    if (autoCycle && availableAnimations.length > 1) {
      const currentTime = state.clock.elapsedTime * 1000; // Convert to milliseconds
      
      if (currentTime - lastCycleTime.current >= cycleInterval) {
        lastCycleTime.current = currentTime;
        
        // Fade out current animation
        const currentAction = actions[currentAnimation];
        if (currentAction) {
          currentAction.fadeOut(0.5);
        }

        // Move to next animation
        const nextIndex = (animationIndex + 1) % availableAnimations.length;
        setAnimationIndex(nextIndex);
        const nextAnim = availableAnimations[nextIndex];
        setCurrentAnimation(nextAnim);

        // Fade in next animation
        const nextAction = actions[nextAnim];
        if (nextAction) {
          nextAction.reset().fadeIn(0.5).play();
          nextAction.setLoop(THREE.LoopRepeat, Infinity);
        }
      }
    }
  });

  // Clone the scene to avoid issues with multiple instances
  const clonedScene = scene.clone();

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <primitive object={clonedScene} />
      
      {/* Display animation name above the robot */}
      {currentAnimation && (
        <Text
          position={[0, 3, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {currentAnimation}
        </Text>
      )}
    </group>
  );
}

// Preload the robot model
useGLTF.preload("./models/robots/robot.glb");
