import { useFrame, useThree } from '@react-three/fiber';
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ParticleEffectsProvider } from '@/support_modules/particle_effects';
import Robot from './robots/Robot';

const RTS_CAMERA_DEFAULTS = {
  target: new THREE.Vector3(0, 0, 0),
  yaw: Math.PI / 4,
  pitch: THREE.MathUtils.degToRad(52),
  distance: 38,
  moveSpeed: 26,
  rotateSpeed: 1.9,
  zoomSpeed: 1.2,
  minDistance: 18,
  maxDistance: 70,
  edgeThresholdPx: 24,
  edgePanSpeed: 1,
  minPitch: THREE.MathUtils.degToRad(35),
  maxPitch: THREE.MathUtils.degToRad(68),
};

function StarcraftCameraController() {
  const { camera, gl, size } = useThree();
  const stateRef = useRef({
    pressedKeys: new Set(),
    mousePosition: { x: size.width / 2, y: size.height / 2 },
    rightMouseDown: false,
  });

  const spherical = useMemo(
    () => new THREE.Spherical(RTS_CAMERA_DEFAULTS.distance, RTS_CAMERA_DEFAULTS.pitch, RTS_CAMERA_DEFAULTS.yaw),
    []
  );

  const target = useMemo(() => RTS_CAMERA_DEFAULTS.target.clone(), []);
  const cameraOffset = useMemo(() => new THREE.Vector3(), []);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.fov = 45;
    camera.near = 0.1;
    camera.far = 1200;
    camera.updateProjectionMatrix();
  }, [camera]);

  useEffect(() => {
    const dom = gl.domElement;

    const onContextMenu = (event) => event.preventDefault();

    const onKeyDown = (event) => {
      stateRef.current.pressedKeys.add(event.code);
    };

    const onKeyUp = (event) => {
      stateRef.current.pressedKeys.delete(event.code);
    };

    const onMouseDown = (event) => {
      if (event.button === 2) {
        stateRef.current.rightMouseDown = true;
      }
    };

    const onMouseUp = (event) => {
      if (event.button === 2) {
        stateRef.current.rightMouseDown = false;
      }
    };

    const onMouseMove = (event) => {
      const rect = dom.getBoundingClientRect();
      stateRef.current.mousePosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      if (!stateRef.current.rightMouseDown) return;

      spherical.theta -= event.movementX * 0.004;
      spherical.phi = THREE.MathUtils.clamp(
        spherical.phi + event.movementY * 0.003,
        RTS_CAMERA_DEFAULTS.minPitch,
        RTS_CAMERA_DEFAULTS.maxPitch
      );
    };

    const onWheel = (event) => {
      event.preventDefault();
      const zoomDelta = event.deltaY * 0.01 * RTS_CAMERA_DEFAULTS.zoomSpeed;
      spherical.radius = THREE.MathUtils.clamp(
        spherical.radius + zoomDelta,
        RTS_CAMERA_DEFAULTS.minDistance,
        RTS_CAMERA_DEFAULTS.maxDistance
      );
    };

    dom.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('mousemove', onMouseMove);
    dom.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      dom.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('mousemove', onMouseMove);
      dom.removeEventListener('wheel', onWheel);
    };
  }, [gl, spherical]);

  useFrame((_, delta) => {
    const { pressedKeys, mousePosition } = stateRef.current;
    const moveVector = new THREE.Vector3();

    forward.set(Math.sin(spherical.theta), 0, Math.cos(spherical.theta)).normalize();
    right.set(forward.z, 0, -forward.x).normalize();

    if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp')) moveVector.add(forward);
    if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown')) moveVector.sub(forward);
    if (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight')) moveVector.add(right);
    if (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft')) moveVector.sub(right);

    if (pressedKeys.has('KeyQ')) spherical.theta += RTS_CAMERA_DEFAULTS.rotateSpeed * delta;
    if (pressedKeys.has('KeyE')) spherical.theta -= RTS_CAMERA_DEFAULTS.rotateSpeed * delta;

    const nearLeftEdge = mousePosition.x <= RTS_CAMERA_DEFAULTS.edgeThresholdPx;
    const nearRightEdge = mousePosition.x >= size.width - RTS_CAMERA_DEFAULTS.edgeThresholdPx;
    const nearTopEdge = mousePosition.y <= RTS_CAMERA_DEFAULTS.edgeThresholdPx;
    const nearBottomEdge = mousePosition.y >= size.height - RTS_CAMERA_DEFAULTS.edgeThresholdPx;

    if (nearTopEdge) moveVector.add(forward.clone().multiplyScalar(RTS_CAMERA_DEFAULTS.edgePanSpeed));
    if (nearBottomEdge) moveVector.sub(forward.clone().multiplyScalar(RTS_CAMERA_DEFAULTS.edgePanSpeed));
    if (nearRightEdge) moveVector.add(right.clone().multiplyScalar(RTS_CAMERA_DEFAULTS.edgePanSpeed));
    if (nearLeftEdge) moveVector.sub(right.clone().multiplyScalar(RTS_CAMERA_DEFAULTS.edgePanSpeed));

    if (moveVector.lengthSq() > 0) {
      moveVector.normalize().multiplyScalar(RTS_CAMERA_DEFAULTS.moveSpeed * delta * (spherical.radius / 32));
      target.add(moveVector);
      target.x = THREE.MathUtils.clamp(target.x, -95, 95);
      target.z = THREE.MathUtils.clamp(target.z, -95, 95);
    }

    cameraOffset.setFromSpherical(spherical);
    camera.position.copy(target).add(cameraOffset);
    camera.lookAt(target);
  });

  return null;
}

export default function ModelingSandbox1() {
  return (
    <>
      <StarcraftCameraController />

      {/* Realistic sky and environment */}
      <color attach='background' args={['#87CEEB']} />
      <fog attach='fog' args={['#87CEEB', 50, 200]} />

      {/* Realistic lighting setup */}
      <ambientLight intensity={0.4} color='#ffffff' />

      <hemisphereLight intensity={0.6} color='#ffffff' groundColor='#8B7355' />

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

      <directionalLight position={[-5, 10, -5]} intensity={0.3} color='#ffffff' />

      <directionalLight position={[0, 5, -10]} intensity={0.2} color='#ffffff' />

      <ParticleEffectsProvider>
        <Physics timeStep='vary'>
          {/* Ground plane - realistic surface */}
          <RigidBody type='fixed' position={[0, 0, 0]}>
            <CuboidCollider args={[100, 0.1, 100]} position={[0, -0.1, 0]} />
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[200, 200]} />
              <meshStandardMaterial color='#8B7355' roughness={0.9} metalness={0.1} />
            </mesh>
          </RigidBody>

          <gridHelper args={[200, 200, '#888888', '#cccccc']} position={[0, 0.01, 0]} />

          <Suspense fallback={null}>
            <Robot position={[5, 0, 0]} scale={1} autoCycle={true} cycleInterval={3000} />
          </Suspense>
        </Physics>
      </ParticleEffectsProvider>
    </>
  );
}
