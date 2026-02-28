import { Html, KeyboardControls, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import CharacterModel from '../third_person_blender_integrated/CharacterModel';
import { RPG_KEYBOARD_MAP } from '../rpg/config/progressionConfig';
import Ecctrl from '../third_person_controller/Ecctrl';

const SPAWN_POINT = new THREE.Vector3(0, 1.5, 0);

function PlayerCharacter({ controllerRef }) {
  return (
    <Ecctrl
      animated
      springK={2}
      dampingC={0.2}
      autoBalanceSpringK={1.2}
      autoBalanceDampingC={0.04}
      autoBalanceSpringOnY={0.7}
      autoBalanceDampingOnY={0.05}
      camInitDis={-6}
      camMaxDis={-10}
      camCollisionOffset={0.3}
      camInitDir={{ x: -0.26, y: Math.PI }}
      camTargetPos={{ x: 0, y: 0.45, z: 0 }}
      position={SPAWN_POINT.toArray()}
      ref={controllerRef}
    >
      <Suspense
        fallback={
          <mesh castShadow>
            <capsuleGeometry args={[0.35, 0.8, 8, 16]} />
            <meshStandardMaterial color='#1a1a2e' roughness={0.5} metalness={0.1} />
          </mesh>
        }
      >
        <CharacterModel />
      </Suspense>
    </Ecctrl>
  );
}

function FloatingOrb({ position, color, intensity = 1 }) {
  const orbRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (orbRef.current) {
      orbRef.current.position.y = position[1] + Math.sin(time * 0.8 + position[0]) * 0.3;
      orbRef.current.rotation.y = time * 0.5;
    }
  });

  return (
    <group ref={orbRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={intensity}
          toneMapped={false}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={4 * intensity} distance={15} color={color} decay={2} />
    </group>
  );
}

function GlowingCrystal({ position, color, size = 1 }) {
  const crystalRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (crystalRef.current) {
      crystalRef.current.rotation.y = time * 0.3;
      crystalRef.current.rotation.x = Math.sin(time * 0.4) * 0.1;
    }
  });

  return (
    <group ref={crystalRef} position={position}>
      <mesh castShadow>
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.6}
          toneMapped={false}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.85}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={3} distance={12} color={color} decay={2} />
    </group>
  );
}

function DarkPillar({ position, height = 3 }) {
  return (
    <RigidBody type='fixed' colliders='cuboid' position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 0.8, height, 16]} />
        <meshStandardMaterial 
          color='#0a0a0f' 
          roughness={0.9} 
          metalness={0.1}
          emissive='#1a1a2e'
          emissiveIntensity={0.1}
        />
      </mesh>
    </RigidBody>
  );
}

function DarkPlatform({ position, size = [4, 0.3, 4] }) {
  return (
    <RigidBody type='fixed' colliders='cuboid' position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color='#1a1a2e' 
          roughness={0.8} 
          metalness={0.2}
          emissive='#16213e'
          emissiveIntensity={0.15}
        />
      </mesh>
    </RigidBody>
  );
}

function MovingPlatform({ startPosition, range, speed = 0.5 }) {
  const platformRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (platformRef.current) {
      const offset = Math.sin(time * speed) * range;
      platformRef.current.setNextKinematicTranslation({
        x: startPosition[0] + offset,
        y: startPosition[1],
        z: startPosition[2],
      });
    }
  });

  return (
    <RigidBody type='kinematicPosition' ref={platformRef} colliders={false}>
      <CuboidCollider args={[2, 0.2, 2]} />
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 0.4, 4]} />
        <meshStandardMaterial 
          color='#16213e' 
          emissive='#0f3460'
          emissiveIntensity={0.3}
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>
    </RigidBody>
  );
}

export default function DarkScene() {
  const controllerRef = useRef();
  const { gl } = useThree();

  useEffect(() => {
    // Set background to pure black
    gl.setClearColor('#000000', 1);
    
    return () => {
      // Reset to default when unmounting (optional)
      gl.setClearColor('#000000', 1);
    };
  }, [gl]);

  useFrame(() => {
    const rigidBody = controllerRef.current?.group;
    if (!rigidBody) {
      return;
    }

    const translation = rigidBody.translation();
    if (translation.y < -10) {
      rigidBody.setTranslation(SPAWN_POINT, true);
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <>
      <color attach='background' args={['#000000']} />
      <fog attach='fog' args={['#000000', 15, 50]} />
      <ambientLight intensity={0.1} color='#0a0a0f' />
      <hemisphereLight intensity={0.05} color='#000000' groundColor='#000000' />
      <directionalLight 
        castShadow 
        position={[10, 20, 10]} 
        intensity={0.2} 
        color='#1a1a2e' 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      <Physics timeStep='vary'>
        <KeyboardControls map={RPG_KEYBOARD_MAP}>
          <PlayerCharacter controllerRef={controllerRef} />
        </KeyboardControls>

        {/* Main ground platform */}
        <RigidBody type='fixed' colliders='cuboid' position={[0, -0.2, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[40, 0.4, 40]} />
            <meshStandardMaterial 
              color='#0a0a0f' 
              roughness={0.9} 
              metalness={0.05}
              emissive='#0f0f1a'
              emissiveIntensity={0.1}
            />
          </mesh>
        </RigidBody>

        {/* Additional ground-level lights for better illumination */}
        <pointLight position={[-6, 1, -6]} intensity={3} distance={10} color='#6a0dad' decay={2} />
        <pointLight position={[6, 1, -6]} intensity={3} distance={10} color='#0d6aad' decay={2} />
        <pointLight position={[-6, 1, 6]} intensity={3} distance={10} color='#ad0d6a' decay={2} />
        <pointLight position={[6, 1, 6]} intensity={3} distance={10} color='#0dad6a' decay={2} />
        <pointLight position={[0, 1, -10]} intensity={4} distance={12} color='#ad6a0d' decay={2} />
        <pointLight position={[0, 1, 10]} intensity={4} distance={12} color='#6aad0d' decay={2} />

        {/* Dark pillars */}
        <DarkPillar position={[-8, 1.5, -8]} height={4} />
        <DarkPillar position={[8, 1.5, -8]} height={4} />
        <DarkPillar position={[-8, 1.5, 8]} height={4} />
        <DarkPillar position={[8, 1.5, 8]} height={4} />
        <DarkPillar position={[0, 1.5, -12]} height={5} />
        <DarkPillar position={[0, 1.5, 12]} height={5} />

        {/* Elevated platforms */}
        <DarkPlatform position={[-6, 2, -6]} size={[3, 0.3, 3]} />
        <DarkPlatform position={[6, 2, -6]} size={[3, 0.3, 3]} />
        <DarkPlatform position={[-6, 2, 6]} size={[3, 0.3, 3]} />
        <DarkPlatform position={[6, 2, 6]} size={[3, 0.3, 3]} />
        <DarkPlatform position={[0, 3, -10]} size={[4, 0.3, 4]} />
        <DarkPlatform position={[0, 3, 10]} size={[4, 0.3, 4]} />

        {/* Moving platform */}
        <MovingPlatform startPosition={[0, 1.5, 0]} range={4} speed={0.6} />

        {/* Floating orbs */}
        <FloatingOrb position={[-6, 3.5, -6]} color='#6a0dad' intensity={1.2} />
        <FloatingOrb position={[6, 3.5, -6]} color='#0d6aad' intensity={1.2} />
        <FloatingOrb position={[-6, 3.5, 6]} color='#ad0d6a' intensity={1.2} />
        <FloatingOrb position={[6, 3.5, 6]} color='#0dad6a' intensity={1.2} />
        <FloatingOrb position={[0, 4.5, -10]} color='#ad6a0d' intensity={1.5} />
        <FloatingOrb position={[0, 4.5, 10]} color='#6aad0d' intensity={1.5} />

        {/* Glowing crystals */}
        <GlowingCrystal position={[-3, 0.8, -3]} color='#8b00ff' size={0.6} />
        <GlowingCrystal position={[3, 0.8, -3]} color='#008bff' size={0.6} />
        <GlowingCrystal position={[-3, 0.8, 3]} color='#ff008b' size={0.6} />
        <GlowingCrystal position={[3, 0.8, 3]} color='#00ff8b' size={0.6} />
        <GlowingCrystal position={[0, 0.8, -5]} color='#ff8b00' size={0.8} />
        <GlowingCrystal position={[0, 0.8, 5]} color='#8bff00' size={0.8} />

        {/* Additional decorative elements */}
        <RigidBody type='fixed' colliders='cuboid' position={[-12, 0.5, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2, 1, 8]} />
            <meshStandardMaterial 
              color='#0f0f1a' 
              roughness={0.85} 
              metalness={0.15}
              emissive='#1a1a2e'
              emissiveIntensity={0.2}
            />
          </mesh>
        </RigidBody>

        <RigidBody type='fixed' colliders='cuboid' position={[12, 0.5, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2, 1, 8]} />
            <meshStandardMaterial 
              color='#0f0f1a' 
              roughness={0.85} 
              metalness={0.15}
              emissive='#1a1a2e'
              emissiveIntensity={0.2}
            />
          </mesh>
        </RigidBody>

        {/* Title text */}
        <Text 
          position={[0, 5, -15]} 
          fontSize={1.2} 
          color='#6a0dad' 
          anchorX='center'
          outlineWidth={0.02}
          outlineColor='#000000'
        >
          Dark Realm
        </Text>
      </Physics>
    </>
  );
}
