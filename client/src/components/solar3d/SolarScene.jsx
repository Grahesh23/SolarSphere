import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { SolarInstallation } from './SolarInstallation';
import { EnergyParticles } from './EnergyParticles';
import { useMouseParallax } from './useMouseParallax';
import { useReducedMotion } from './useReducedMotion';

function CameraRig({ modelGroupRef, modelRadiusRef }) {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    if (!modelGroupRef.current) return;

    const box = new THREE.Box3().setFromObject(modelGroupRef.current);
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    modelRadiusRef.current = sphere.radius;

    const aspect = size.width / size.height;
    const target = sphere.center.clone();
    const cameraPos = new THREE.Vector3(
      6.3 + (aspect > 1 ? 0.6 : 0.2),
      4.5 + (aspect > 1 ? 0.2 : 0.4),
      6.8 + (aspect > 1 ? 0.2 : 0.4),
    );

    camera.position.copy(cameraPos);
    camera.lookAt(target.x, target.y + 0.9, target.z);
    camera.updateProjectionMatrix();
  }, [camera, modelGroupRef, modelRadiusRef, size]);

  return null;
}

function SceneRig({ modelGroupRef, modelRadiusRef }) {
  const { size } = useThree();
  const group = useRef();
  const pointer = useMouseParallax(true);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (!group.current || !modelRadiusRef.current) return;

    const fitScale = size.width < 640 ? 0.62 : size.width < 900 ? 0.72 : size.width < 1280 ? 0.82 : 0.92;
    group.current.scale.setScalar(fitScale);
  }, [modelRadiusRef, size]);

  useFrame((state, delta) => {
    if (!group.current) return;

    const t = state.clock.getElapsedTime();
    const targetX = pointer.y * 0.18;
    const targetZ = pointer.x * 0.12;

    if (reduced) {
      group.current.rotation.y = -0.55;
      group.current.rotation.x = 0.2;
      group.current.rotation.z = 0;
      group.current.position.y = 0;
    } else {
      group.current.rotation.y += 0.008 * delta * 60;
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4, delta);
      group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -targetZ, 4, delta);
      group.current.position.y = Math.sin(t * 1.1) * 0.1;
    }

    state.camera.lookAt(0, 0.8, 0);
    state.invalidate();
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <SolarInstallation reduced={reduced} modelGroupRef={modelGroupRef} />
      {!reduced && <EnergyParticles reduced={reduced} />}
    </group>
  );
}

export function SolarScene() {
  const reduced = useReducedMotion();
  const modelGroupRef = useRef();
  const modelRadiusRef = useRef(1);

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
      camera={{ position: [7.4, 5, 7.8], fov: 31 }}
      frameloop="always"
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.9;
      }}
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    >
      <CameraRig modelGroupRef={modelGroupRef} modelRadiusRef={modelRadiusRef} />
      <ambientLight intensity={0.8} color="#cfe9ff" />
      <hemisphereLight args={['#a78bfa', '#09182d', 0.75]} />
      <directionalLight
        castShadow
        position={[5, 7, 6]}
        intensity={1.8}
        color="#ffd7a0"
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 4, -4]} intensity={0.8} color="#87b8ff" />

      <SceneRig modelGroupRef={modelGroupRef} modelRadiusRef={modelRadiusRef} />
      <group position={[2.8, 3.1, -1.8]} scale={[0.9, 0.9, 0.9]}>
        <SolarInstallation reduced={reduced} isSunOnly />
      </group>

      <ContactShadows
        position={[0, 0.03, 0]}
        opacity={0.42}
        scale={5.8}
        blur={2}
        far={5}
        resolution={1024}
        color="#2d6bb4"
      />
    </Canvas>
  );
}
