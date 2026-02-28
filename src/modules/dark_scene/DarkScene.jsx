import { Html, KeyboardControls, Text, Stars } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import CharacterModel from '../third_person_blender_integrated/CharacterModel';
import { RPG_KEYBOARD_MAP } from '../rpg/config/progressionConfig';
import Ecctrl from '../third_person_controller/Ecctrl';

const SPAWN_POINT = new THREE.Vector3(0, 1.5, 0);

// Rave beat system - creates synchronized strobing effect
class RaveBeat {
  constructor(bpm = 140) {
    this.bpm = bpm;
    this.beatsPerSecond = bpm / 60;
  }

  getFlashIntensity(time) {
    // Flashing disabled for development - return constant intensity
    return 1.0;
    
    // Create an intense rave strobing pattern with sharp on/off transitions
    // const beatPhase = (time * this.beatsPerSecond) % 1;
    // 
    // // Intense strobe pattern: multiple quick flashes per beat
    // if (beatPhase < 0.05) {
    //   // Strong flash at beat start
    //   return 2.5;
    // } else if (beatPhase < 0.08) {
    //   // Quick off
    //   return 0.05;
    // } else if (beatPhase < 0.12) {
    //   // Double flash
    //   return 2.2;
    // } else if (beatPhase < 0.15) {
    //   return 0.05;
    // } else if (beatPhase < 0.18) {
    //   // Triple flash
    //   return 2.0;
    // } else if (beatPhase < 0.22) {
    //   return 0.05;
    // } else if (beatPhase < 0.25) {
    //   // Another flash
    //   return 1.8;
    // } else if (beatPhase < 0.4) {
    //   // Off period
    //   return 0.1;
    // } else if (beatPhase < 0.43) {
    //   // Mid-beat strong flash
    //   return 2.3;
    // } else if (beatPhase < 0.46) {
    //   return 0.05;
    // } else if (beatPhase < 0.49) {
    //   // Quick double flash
    //   return 2.0;
    // } else if (beatPhase < 0.52) {
    //   return 0.05;
    // } else if (beatPhase < 0.55) {
    //   // Final flash before next beat
    //   return 1.5;
    // } else {
    //   // Off until next beat
    //   return 0.05;
    // }
  }
}

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

function FloatingOrb({ position, color, intensity = 1, raveBeat }) {
  const orbRef = useRef();
  const lightRef = useRef();
  const materialRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (orbRef.current) {
      orbRef.current.position.y = position[1] + Math.sin(time * 0.8 + position[0]) * 0.3;
      orbRef.current.rotation.y = time * 0.5;
    }
    
    // Synced rave strobing effect - sharp on/off pattern
    const flashIntensity = raveBeat.getFlashIntensity(time);
    
    if (lightRef.current) {
      lightRef.current.intensity = 4 * intensity * flashIntensity;
    }
    
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = intensity * flashIntensity;
    }
  });

  return (
    <group ref={orbRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial 
          ref={materialRef}
          color={color} 
          emissive={color} 
          emissiveIntensity={intensity}
          toneMapped={false}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} intensity={4 * intensity} distance={15} color={color} decay={2} />
    </group>
  );
}

function GlowingCrystal({ position, color, size = 1, raveBeat }) {
  const crystalRef = useRef();
  const lightRef = useRef();
  const materialRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (crystalRef.current) {
      crystalRef.current.rotation.y = time * 0.3;
      crystalRef.current.rotation.x = Math.sin(time * 0.4) * 0.1;
    }
    
    // Synced rave strobing effect - sharp on/off pattern
    const flashIntensity = raveBeat.getFlashIntensity(time);
    
    if (lightRef.current) {
      lightRef.current.intensity = 3 * flashIntensity;
    }
    
    if (materialRef.current) {
      materialRef.current.emissiveIntensity = 0.6 * flashIntensity;
    }
  });

  return (
    <group ref={crystalRef} position={position}>
      <mesh castShadow>
        <octahedronGeometry args={[size, 0]} />
        <meshStandardMaterial 
          ref={materialRef}
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
      <pointLight ref={lightRef} position={[0, 0, 0]} intensity={3} distance={12} color={color} decay={2} />
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

function FlashingGroundLight({ position, color, baseIntensity = 3, raveBeat }) {
  const lightRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (lightRef.current) {
      // Synced rave strobing effect
      const flashIntensity = raveBeat.getFlashIntensity(time);
      lightRef.current.intensity = baseIntensity * flashIntensity;
    }
  });

  return <pointLight ref={lightRef} position={position} intensity={baseIntensity} distance={10} color={color} decay={2} />;
}

function FloatingParticles({ count = 100 }) {
  const particlesRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.05;
      particlesRef.current.rotation.x = Math.sin(time * 0.1) * 0.1;
    }
  });

  const particles = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      position: [
        (Math.random() - 0.5) * 60,
        Math.random() * 20 + 2,
        (Math.random() - 0.5) * 60,
      ],
      size: Math.random() * 0.05 + 0.02,
    }));
  }, [count]);

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshStandardMaterial
            color='#6a0dad'
            emissive='#6a0dad'
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function GlowingRune({ position, rotation = [0, 0, 0] }) {
  const runeRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (runeRef.current) {
      runeRef.current.rotation.y = rotation[1] + time * 0.2;
      const pulse = Math.sin(time * 2) * 0.1 + 0.9;
      runeRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={runeRef} position={position} rotation={rotation}>
      <mesh>
        <ringGeometry args={[0.8, 1.2, 32]} />
        <meshStandardMaterial
          color='#8b00ff'
          emissive='#8b00ff'
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh>
        <ringGeometry args={[0.4, 0.6, 16]} />
        <meshStandardMaterial
          color='#ff008b'
          emissive='#ff008b'
          emissiveIntensity={1.0}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2} distance={8} color='#8b00ff' decay={2} />
    </group>
  );
}

function DarkArch({ position, height = 6, width = 4 }) {
  const archRef = useRef();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (archRef.current) {
      // Subtle pulsing glow
      const pulse = Math.sin(time * 0.5) * 0.05 + 0.95;
      archRef.current.children.forEach((child) => {
        if (child.material) {
          child.material.emissiveIntensity = 0.1 * pulse;
        }
      });
    }
  });

  return (
    <group ref={archRef} position={position}>
      <RigidBody type='fixed' colliders='cuboid' position={[-width / 2, height / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.5, height, 0.5]} />
          <meshStandardMaterial
            color='#0a0a0f'
            roughness={0.9}
            metalness={0.1}
            emissive='#1a1a2e'
            emissiveIntensity={0.1}
          />
        </mesh>
      </RigidBody>
      <RigidBody type='fixed' colliders='cuboid' position={[width / 2, height / 2, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.5, height, 0.5]} />
          <meshStandardMaterial
            color='#0a0a0f'
            roughness={0.9}
            metalness={0.1}
            emissive='#1a1a2e'
            emissiveIntensity={0.1}
          />
        </mesh>
      </RigidBody>
      <mesh castShadow receiveShadow>
        <torusGeometry args={[width / 2, 0.3, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color='#0a0a0f'
          roughness={0.9}
          metalness={0.1}
          emissive='#1a1a2e'
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
}

export default function DarkScene() {
  const controllerRef = useRef();
  const { gl } = useThree();
  const raveBeat = useRef(new RaveBeat(140)).current; // 140 BPM rave beat

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
      <fog attach='fog' args={['#050510', 12, 45]} />
      <Stars radius={100} depth={50} count={2000} factor={4} fade speed={0.5} />
      <ambientLight intensity={0.08} color='#0a0a0f' />
      <hemisphereLight intensity={0.03} color='#000000' groundColor='#000000' />
      <directionalLight 
        castShadow 
        position={[10, 20, 10]} 
        intensity={0.15} 
        color='#1a1a2e' 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      
      {/* Atmospheric particles */}
      <FloatingParticles count={80} />

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
        <FlashingGroundLight position={[-6, 1, -6]} color='#6a0dad' baseIntensity={3} raveBeat={raveBeat} />
        <FlashingGroundLight position={[6, 1, -6]} color='#0d6aad' baseIntensity={3} raveBeat={raveBeat} />
        <FlashingGroundLight position={[-6, 1, 6]} color='#ad0d6a' baseIntensity={3} raveBeat={raveBeat} />
        <FlashingGroundLight position={[6, 1, 6]} color='#0dad6a' baseIntensity={3} raveBeat={raveBeat} />
        <FlashingGroundLight position={[0, 1, -10]} color='#ad6a0d' baseIntensity={4} raveBeat={raveBeat} />
        <FlashingGroundLight position={[0, 1, 10]} color='#6aad0d' baseIntensity={4} raveBeat={raveBeat} />

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
        <FloatingOrb position={[-6, 3.5, -6]} color='#6a0dad' intensity={1.2} raveBeat={raveBeat} />
        <FloatingOrb position={[6, 3.5, -6]} color='#0d6aad' intensity={1.2} raveBeat={raveBeat} />
        <FloatingOrb position={[-6, 3.5, 6]} color='#ad0d6a' intensity={1.2} raveBeat={raveBeat} />
        <FloatingOrb position={[6, 3.5, 6]} color='#0dad6a' intensity={1.2} raveBeat={raveBeat} />
        <FloatingOrb position={[0, 4.5, -10]} color='#ad6a0d' intensity={1.5} raveBeat={raveBeat} />
        <FloatingOrb position={[0, 4.5, 10]} color='#6aad0d' intensity={1.5} raveBeat={raveBeat} />

        {/* Glowing crystals */}
        <GlowingCrystal position={[-3, 0.8, -3]} color='#8b00ff' size={0.6} raveBeat={raveBeat} />
        <GlowingCrystal position={[3, 0.8, -3]} color='#008bff' size={0.6} raveBeat={raveBeat} />
        <GlowingCrystal position={[-3, 0.8, 3]} color='#ff008b' size={0.6} raveBeat={raveBeat} />
        <GlowingCrystal position={[3, 0.8, 3]} color='#00ff8b' size={0.6} raveBeat={raveBeat} />
        <GlowingCrystal position={[0, 0.8, -5]} color='#ff8b00' size={0.8} raveBeat={raveBeat} />
        <GlowingCrystal position={[0, 0.8, 5]} color='#8bff00' size={0.8} raveBeat={raveBeat} />

        {/* Dark arches for atmosphere */}
        <DarkArch position={[-15, 0, -15]} height={8} width={5} />
        <DarkArch position={[15, 0, -15]} height={8} width={5} />
        <DarkArch position={[-15, 0, 15]} height={8} width={5} />
        <DarkArch position={[15, 0, 15]} height={8} width={5} />

        {/* Glowing runes */}
        <GlowingRune position={[-8, 4, -8]} rotation={[Math.PI / 2, 0, 0]} />
        <GlowingRune position={[8, 4, -8]} rotation={[Math.PI / 2, Math.PI / 4, 0]} />
        <GlowingRune position={[-8, 4, 8]} rotation={[Math.PI / 2, Math.PI / 2, 0]} />
        <GlowingRune position={[8, 4, 8]} rotation={[Math.PI / 2, Math.PI * 0.75, 0]} />
        <GlowingRune position={[0, 5, -12]} rotation={[Math.PI / 2, 0, 0]} />
        <GlowingRune position={[0, 5, 12]} rotation={[Math.PI / 2, Math.PI / 2, 0]} />

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

        {/* Distant floating structures */}
        <group position={[0, 8, -25]}>
          <mesh>
            <boxGeometry args={[3, 0.3, 3]} />
            <meshStandardMaterial
              color='#0a0a0f'
              emissive='#1a1a2e'
              emissiveIntensity={0.2}
              transparent
              opacity={0.6}
            />
          </mesh>
          <pointLight position={[0, 0, 0]} intensity={1} distance={10} color='#6a0dad' decay={2} />
        </group>

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
