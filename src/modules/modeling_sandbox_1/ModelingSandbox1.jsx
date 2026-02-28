import { KeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import CharacterModel from '../third_person_blender_integrated/CharacterModel';
import { RPG_KEYBOARD_MAP } from '../rpg/config/progressionConfig';
import Ecctrl from '../third_person_controller/Ecctrl';

const SPAWN_POINT = new THREE.Vector3(0, 1.5, 0);

function PlayerCharacter({ controllerRef }) {
  return (
    <Ecctrl
      springK={2}
      dampingC={0.2}
      camInitDis={-6}
      camMaxDis={-10}
      camCollisionOffset={0.3}
      camInitDir={{ x: 0.26, y: 0 }}
      camTargetPos={{ x: 0, y: 0.5, z: 0 }}
      position={SPAWN_POINT.toArray()}
      ref={controllerRef}
    >
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color='#60a5fa' roughness={0.5} metalness={0.1} />
      </mesh>
    </Ecctrl>
  );
}

export default function ModelingSandbox1() {
  const controllerRef = useRef();

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
      {/* Realistic sky and environment */}
      <color attach='background' args={['#87CEEB']} />
      <fog attach='fog' args={['#87CEEB', 50, 200]} />
      
      {/* Realistic lighting setup */}
      {/* Ambient light - soft overall illumination */}
      <ambientLight intensity={0.4} color='#ffffff' />
      
      {/* Hemisphere light - simulates sky and ground reflection */}
      <hemisphereLight 
        intensity={0.6} 
        color='#ffffff' 
        groundColor='#8B7355' 
      />
      
      {/* Main directional light (sun) - primary light source with shadows */}
      <directionalLight 
        castShadow 
        position={[10, 20, 5]} 
        intensity={1.2} 
        color='#ffffff' 
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={0.1}
        shadow-camera-far={200}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      />
      
      {/* Fill light - soft light from opposite side to reduce harsh shadows */}
      <directionalLight 
        position={[-5, 10, -5]} 
        intensity={0.3} 
        color='#ffffff' 
      />
      
      {/* Rim light - subtle backlight for depth */}
      <directionalLight 
        position={[0, 5, -10]} 
        intensity={0.2} 
        color='#ffffff' 
      />

      <Physics timeStep='vary'>
        <KeyboardControls map={RPG_KEYBOARD_MAP}>
          <PlayerCharacter controllerRef={controllerRef} />
        </KeyboardControls>

        {/* Ground plane - realistic surface */}
        <RigidBody type='fixed' position={[0, 0, 0]}>
          <CuboidCollider args={[100, 0.1, 100]} position={[0, -0.1, 0]} />
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial 
              color='#8B7355' 
              roughness={0.9} 
              metalness={0.1}
            />
          </mesh>
        </RigidBody>

        {/* Grid helper for reference */}
        <gridHelper args={[200, 200, '#888888', '#cccccc']} position={[0, 0.01, 0]} />
      </Physics>
    </>
  );
}
