import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";

/**
 * MovingPlatforms Component
 * 
 * Finds and animates moving platforms from the Blender scene based on naming patterns:
 * 
 * Naming Patterns:
 * - "platform_move_*" - Moves horizontally (sinusoidal motion)
 *   - Optional suffix: "_x", "_y", "_z" for axis (default: x)
 *   - Optional suffix: "_speed_<number>" for speed (default: 2)
 *   - Optional suffix: "_amplitude_<number>" for distance (default: 5)
 *   Example: "platform_move_1_x_speed_2_amplitude_5"
 * 
 * - "platform_rotate_*" - Rotates around an axis
 *   - Optional suffix: "_x", "_y", "_z" for axis (default: y)
 *   - Optional suffix: "_speed_<number>" for rotation speed (default: 0.5)
 *   Example: "platform_rotate_1_y_speed_0.5"
 * 
 * - "platform_elevate_*" - Moves vertically (sinusoidal motion)
 *   - Optional suffix: "_speed_<number>" for speed (default: 2)
 *   - Optional suffix: "_amplitude_<number>" for distance (default: 2)
 *   - Optional suffix: "_offset_<number>" for base height offset (default: 0)
 *   Example: "platform_elevate_1_speed_2_amplitude_2"
 * 
 * - "platform_circular_*" - Moves in a circular path
 *   - Optional suffix: "_radius_<number>" for circle radius (default: 5)
 *   - Optional suffix: "_speed_<number>" for speed (default: 1)
 *   - Optional suffix: "_axis_<x|y|z>" for plane of rotation (default: y)
 *   Example: "platform_circular_1_radius_5_speed_1_axis_y"
 */

function parsePlatformName(name) {
  const parts = name.split("_");
  const typeIndex = parts.indexOf("platform");
  
  if (typeIndex === -1) return null;
  
  const type = parts[typeIndex + 1]; // "move", "rotate", "elevate", "circular"
  const id = parts[typeIndex + 2]; // platform ID
  
  const config = {
    type,
    id,
    name,
  };
  
  // Parse optional parameters
  const speedIndex = parts.indexOf("speed");
  if (speedIndex !== -1) {
    config.speed = parseFloat(parts[speedIndex + 1]) || 2;
  } else {
    config.speed = 2;
  }
  
  const amplitudeIndex = parts.indexOf("amplitude");
  if (amplitudeIndex !== -1) {
    config.amplitude = parseFloat(parts[amplitudeIndex + 1]) || 5;
  } else {
    config.amplitude = type === "elevate" ? 2 : 5;
  }
  
  const offsetIndex = parts.indexOf("offset");
  if (offsetIndex !== -1) {
    config.offset = parseFloat(parts[offsetIndex + 1]) || 0;
  } else {
    config.offset = 0;
  }
  
  const radiusIndex = parts.indexOf("radius");
  if (radiusIndex !== -1) {
    config.radius = parseFloat(parts[radiusIndex + 1]) || 5;
  } else {
    config.radius = 5;
  }
  
  // Parse axis for move and rotate
  const axisIndex = parts.findIndex((p, i) => 
    (p === "x" || p === "y" || p === "z") && 
    (parts[i - 1] === "move" || parts[i - 1] === "rotate" || parts[i - 1] === "axis")
  );
  if (axisIndex !== -1) {
    config.axis = parts[axisIndex];
  } else {
    config.axis = type === "move" ? "x" : type === "rotate" ? "y" : "y";
  }
  
  return config;
}

export default function MovingPlatforms({ 
  scenePath = "./models/third_person_blender_integrated/scene.glb"
}) {
  const { scene, nodes } = useGLTF(scenePath);
  const platformRefs = useRef({});
  const initialPositions = useRef({});
  const initialRotations = useRef({});
  const platformObjects = useRef({});
  const [platformConfigs, setPlatformConfigs] = useState([]);
  
  const quaternionRotation = useMemo(() => new THREE.Quaternion(), []);
  const rotationAxes = useMemo(() => ({
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1),
  }), []);
  
  // Find all platform objects in the scene
  useEffect(() => {
    if (!nodes || !scene) return;
    
    const configs = [];
    const newRefs = {};
    const platformObjs = {};
    
    // Traverse the scene to find platform objects
    scene.traverse((object) => {
      if (object.name && object.name.startsWith("platform_")) {
        const config = parsePlatformName(object.name);
        if (config) {
          // Store the actual object from the scene
          platformObjs[config.name] = object;
          
          // Store initial position and rotation from world matrix
          const worldPos = new THREE.Vector3();
          const worldQuat = new THREE.Quaternion();
          const worldScale = new THREE.Vector3();
          
          object.getWorldPosition(worldPos);
          object.getWorldQuaternion(worldQuat);
          object.getWorldScale(worldScale);
          
          initialPositions.current[config.name] = worldPos.clone();
          initialRotations.current[config.name] = worldQuat.clone();
          
          configs.push({
            ...config,
            object,
          });
          
          // Create ref object for this platform's RigidBody
          newRefs[config.name] = {
            config,
            rigidBodyRef: { current: null },
          };
        }
      }
    });
    
    platformRefs.current = newRefs;
    platformObjects.current = platformObjs;
    setPlatformConfigs(configs);
    
    return () => {
      platformRefs.current = {};
      initialPositions.current = {};
      initialRotations.current = {};
      platformObjects.current = {};
    };
  }, [nodes, scene]);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    Object.values(platformRefs.current).forEach(({ config, rigidBodyRef }) => {
      if (!rigidBodyRef || !rigidBodyRef.current) return;
      
      const initialPos = initialPositions.current[config.name];
      const initialRot = initialRotations.current[config.name];
      const platformObject = platformObjects.current[config.name];
      
      if (!initialPos || !platformObject) return;
      
      let newPos = null;
      let newRot = null;
      
      switch (config.type) {
        case "move": {
          // Horizontal movement (sinusoidal)
          const axis = config.axis;
          const value = config.amplitude * Math.sin(time / config.speed);
          
          newPos = initialPos.clone();
          if (axis === "x") newPos.x += value;
          else if (axis === "y") newPos.y += value;
          else if (axis === "z") newPos.z += value;
          break;
        }
        
        case "rotate": {
          // Rotation around axis
          const axis = rotationAxes[config.axis];
          const angle = time * config.speed;
          
          newRot = quaternionRotation.setFromAxisAngle(axis, angle);
          if (initialRot) {
            newRot.premultiply(initialRot);
          }
          break;
        }
        
        case "elevate": {
          // Vertical movement (sinusoidal)
          const value = config.amplitude * Math.sin(time / config.speed) + config.offset;
          
          newPos = initialPos.clone();
          newPos.y += value;
          break;
        }
        
        case "circular": {
          // Circular motion
          const radius = config.radius;
          const angle = time * config.speed;
          
          newPos = initialPos.clone();
          if (config.axis === "y") {
            // Circular motion in XZ plane
            newPos.x += radius * Math.cos(angle);
            newPos.z += radius * Math.sin(angle);
          } else if (config.axis === "x") {
            // Circular motion in YZ plane
            newPos.y += radius * Math.cos(angle);
            newPos.z += radius * Math.sin(angle);
          } else if (config.axis === "z") {
            // Circular motion in XY plane
            newPos.x += radius * Math.cos(angle);
            newPos.y += radius * Math.sin(angle);
          }
          break;
        }
      }
      
      // Update RigidBody position
      if (newPos) {
        rigidBodyRef.current.setNextKinematicTranslation(newPos);
        // Sync the visual object position with the RigidBody
        platformObject.position.copy(newPos);
      }
      
      // Update RigidBody rotation
      if (newRot) {
        rigidBodyRef.current.setNextKinematicRotation(newRot);
        // Sync the visual object rotation with the RigidBody
        platformObject.quaternion.copy(newRot);
      }
    });
  });
  
  // Render RigidBody wrappers for each platform
  // The visual objects remain in the Blender scene
  // We create invisible RigidBodies that sync with the visual objects via useFrame
  return (
    <>
      {platformConfigs.map((config) => {
        const platformObject = config.object;
        if (!platformObject) return null;
        
        const initialPos = initialPositions.current[config.name];
        if (!initialPos) return null;
        
        const rigidBodyRef = platformRefs.current[config.name]?.rigidBodyRef;
        if (!rigidBodyRef) return null;
        
        // Get bounding box for collider
        const box = new THREE.Box3().setFromObject(platformObject);
        const size = box.getSize(new THREE.Vector3());
        
        return (
          <RigidBody
            key={config.name}
            type="kinematicPosition"
            ref={rigidBodyRef}
            position={[initialPos.x, initialPos.y, initialPos.z]}
            colliders="hull"
            // The visual object is already rendered in BlenderScene
            // This RigidBody provides physics and we sync positions in useFrame
          />
        );
      })}
    </>
  );
}
