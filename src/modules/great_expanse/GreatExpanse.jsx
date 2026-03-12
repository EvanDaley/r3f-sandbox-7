import { PointerLockControls, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Color palette: soft white, pale gold, silver-gray, faint spectral accents
const COLORS = {
  white: '#fefefe',
  paleGold: '#f5e6d3',
  silverGray: '#d4d4d8',
  spectralBlue: '#e0f2fe',
  spectralPurple: '#f3e8ff',
  sanctuary: '#fffef7',
};

const SPAWN_POINT = new THREE.Vector3(0, 1.5, 0);

// First-person controller using Rapier physics
function FirstPersonController({ speed = 5, jumpStrength = 5 }) {
  const { camera } = useThree();
  const rigidBodyRef = useRef();
  const moveState = useRef({ forward: false, backward: false, left: false, right: false, jump: false });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const PI_2 = Math.PI / 2;
  const canJump = useRef(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW':
          moveState.current.forward = true;
          break;
        case 'KeyS':
          moveState.current.backward = true;
          break;
        case 'KeyA':
          moveState.current.left = true;
          break;
        case 'KeyD':
          moveState.current.right = true;
          break;
        case 'Space':
          if (canJump.current) {
            moveState.current.jump = true;
            canJump.current = false;
          }
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
          moveState.current.forward = false;
          break;
        case 'KeyS':
          moveState.current.backward = false;
          break;
        case 'KeyA':
          moveState.current.left = false;
          break;
        case 'KeyD':
          moveState.current.right = false;
          break;
        case 'Space':
          moveState.current.jump = false;
          break;
      }
    };

    const handleMouseMove = (e) => {
      if (document.pointerLockElement) {
        euler.current.setFromQuaternion(camera.quaternion);
        euler.current.y -= e.movementX * 0.0008;
        euler.current.x -= e.movementY * 0.0008;
        euler.current.x = Math.max(-PI_2, Math.min(PI_2, euler.current.x));
        camera.quaternion.setFromEuler(euler.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [camera]);

  useFrame((state, delta) => {
    if (!rigidBodyRef.current) return;

    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(moveState.current.backward) - Number(moveState.current.forward));
    const sideVector = new THREE.Vector3(Number(moveState.current.left) - Number(moveState.current.right), 0, 0);

    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyEuler(new THREE.Euler(0, euler.current.y, 0));

    const velocity = rigidBodyRef.current.linvel();
    
    // Handle jumping
    let newY = velocity.y;
    if (moveState.current.jump && Math.abs(velocity.y) < 0.1) {
      newY = jumpStrength;
      moveState.current.jump = false;
    }

    // Check if grounded for jump cooldown
    if (Math.abs(velocity.y) < 0.1) {
      canJump.current = true;
    }

    rigidBodyRef.current.setLinvel({ x: direction.x, y: newY, z: direction.z });

    // Update camera position to match rigid body (at eye level)
    const translation = rigidBodyRef.current.translation();
    camera.position.set(translation.x, translation.y + 0.5, translation.z);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      position={SPAWN_POINT.toArray()}
      colliders="cuboid"
      enabledTranslations={[true, true, true]}
      enabledRotations={[false, false, false]}
      lockRotations
    >
      <CuboidCollider args={[0.3, 0.9, 0.3]} />
    </RigidBody>
  );
}

// Safe Sanctuary - starting area
function Sanctuary() {
  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow>
          <cylinderGeometry args={[8, 8, 0.2, 32]} />
          <meshStandardMaterial
            color={COLORS.sanctuary}
            roughness={0.3}
            metalness={0.1}
            emissive={COLORS.paleGold}
            emissiveIntensity={0.2}
          />
        </mesh>
      </RigidBody>

      {/* Central pillar */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow>
          <cylinderGeometry args={[0.8, 0.8, 4, 16]} />
          <meshStandardMaterial
            color={COLORS.white}
            roughness={0.2}
            metalness={0.3}
            emissive={COLORS.paleGold}
            emissiveIntensity={0.15}
          />
        </mesh>
      </RigidBody>

      {/* Floating rings around sanctuary */}
      {[1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 1 + i * 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[6 + i * 0.5, 0.15, 16, 32]} />
          <meshStandardMaterial
            color={COLORS.paleGold}
            roughness={0.4}
            metalness={0.5}
            emissive={COLORS.paleGold}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Soft light in sanctuary */}
      <pointLight position={[0, 3, 0]} intensity={2} distance={15} color={COLORS.paleGold} />
    </group>
  );
}

// Geometric structures scattered in the expanse
function CosmicStructures() {
  const structures = [
    // Spheres
    { type: 'sphere', position: [15, 2, -20], scale: 2, color: COLORS.white },
    { type: 'sphere', position: [-18, 1.5, -25], scale: 1.5, color: COLORS.silverGray },
    { type: 'sphere', position: [25, 3, -35], scale: 2.5, color: COLORS.spectralBlue },

    // Monoliths (tall boxes)
    { type: 'monolith', position: [10, 4, -15], scale: [0.8, 8, 0.8], color: COLORS.white },
    { type: 'monolith', position: [-12, 5, -30], scale: [1, 10, 1], color: COLORS.silverGray },
    { type: 'monolith', position: [30, 3.5, -40], scale: [0.6, 7, 0.6], color: COLORS.paleGold },

    // Rings
    { type: 'ring', position: [20, 2, -25], scale: 3, color: COLORS.paleGold },
    { type: 'ring', position: [-25, 1.5, -20], scale: 2.5, color: COLORS.spectralPurple },
    { type: 'ring', position: [35, 3, -50], scale: 4, color: COLORS.white },

    // Floating spires (tall thin cylinders)
    { type: 'spire', position: [5, 6, -10], scale: [0.3, 12, 0.3], color: COLORS.white },
    { type: 'spire', position: [-20, 5, -15], scale: [0.4, 10, 0.4], color: COLORS.silverGray },
    { type: 'spire', position: [40, 4, -45], scale: [0.35, 9, 0.35], color: COLORS.paleGold },

    // Arches
    { type: 'arch', position: [12, 2, -18], scale: 2, color: COLORS.white },
    { type: 'arch', position: [-15, 1.5, -22], scale: 1.5, color: COLORS.spectralBlue },
  ];

  return (
    <group>
      {structures.map((struct, i) => {
        const key = `struct-${i}`;
        const { type, position, scale, color } = struct;

        if (type === 'sphere') {
          return (
            <RigidBody key={key} type="fixed" colliders="ball" position={position}>
              <mesh castShadow>
                <sphereGeometry args={[scale, 32, 32]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.3}
                  metalness={0.2}
                  emissive={color}
                  emissiveIntensity={0.1}
                />
              </mesh>
            </RigidBody>
          );
        }

        if (type === 'monolith') {
          return (
            <RigidBody key={key} type="fixed" colliders="cuboid" position={position}>
              <mesh castShadow>
                <boxGeometry args={scale} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.4}
                  metalness={0.3}
                  emissive={color}
                  emissiveIntensity={0.08}
                />
              </mesh>
            </RigidBody>
          );
        }

        if (type === 'ring') {
          return (
            <RigidBody key={key} type="fixed" colliders="hull" position={position}>
              <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[scale, scale * 0.15, 16, 32]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.3}
                  metalness={0.4}
                  emissive={color}
                  emissiveIntensity={0.2}
                />
              </mesh>
            </RigidBody>
          );
        }

        if (type === 'spire') {
          return (
            <RigidBody key={key} type="fixed" colliders="cuboid" position={position}>
              <mesh castShadow>
                <cylinderGeometry args={[scale[0], scale[0], scale[1], 16]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.3}
                  metalness={0.3}
                  emissive={color}
                  emissiveIntensity={0.12}
                />
              </mesh>
            </RigidBody>
          );
        }

        if (type === 'arch') {
          // Simple arch made from torus segment
          return (
            <RigidBody key={key} type="fixed" colliders="hull" position={position}>
              <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
                <torusGeometry args={[scale * 1.5, scale * 0.3, 16, 32, Math.PI]} />
                <meshStandardMaterial
                  color={color}
                  roughness={0.3}
                  metalness={0.3}
                  emissive={color}
                  emissiveIntensity={0.15}
                />
              </mesh>
            </RigidBody>
          );
        }

        return null;
      })}
    </group>
  );
}

// Ground plane extending into the expanse
function ExpanseGround() {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={[0, -0.1, -100]}>
      <mesh receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial
          color={COLORS.white}
          roughness={0.5}
          metalness={0.1}
          emissive={COLORS.white}
          emissiveIntensity={0.05}
        />
      </mesh>
    </RigidBody>
  );
}

export default function GreatExpanse() {
  const { camera } = useThree();
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  useEffect(() => {
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement !== null);
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, []);

  // Initialize camera position
  useEffect(() => {
    camera.position.set(SPAWN_POINT.x, SPAWN_POINT.y, SPAWN_POINT.z);
    camera.rotation.set(0, 0, 0);
  }, [camera]);

  return (
    <>
      {/* White cosmic background */}
      <color attach="background" args={[COLORS.white]} />
      <fog attach="fog" args={[COLORS.white, 30, 150]} />

      {/* Soft, ethereal lighting */}
      <ambientLight intensity={0.8} color={COLORS.white} />
      <hemisphereLight intensity={0.6} color={COLORS.white} groundColor={COLORS.paleGold} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.5}
        color={COLORS.paleGold}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Pointer lock controls for first-person camera */}
      <PointerLockControls />

      <Physics timeStep="vary" gravity={[0, -9.81, 0]}>
        <FirstPersonController speed={5} />

        {/* Safe sanctuary */}
        <Sanctuary />

        {/* Ground */}
        <ExpanseGround />

        {/* Cosmic structures scattered in the expanse */}
        <CosmicStructures />
      </Physics>

      {/* Instructions overlay */}
      {!isPointerLocked && (
        <Html
          center
          style={{
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              color: COLORS.silverGray,
              textAlign: 'center',
              fontFamily: 'sans-serif',
              fontSize: '18px',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '20px 40px',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>Cosmic Aether</div>
            <div style={{ fontSize: '14px' }}>Click to begin exploring</div>
            <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
              WASD to move • Mouse to look
            </div>
          </div>
        </Html>
      )}
    </>
  );
}
