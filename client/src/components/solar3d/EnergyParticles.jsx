import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export function EnergyParticles({ reduced = false }) {
  const pointsRef = useRef();

  const particleData = useMemo(() => {
    const curves = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.2, 1.9, 0.4),
        new THREE.Vector3(-1.4, 1.7, 0.85),
        new THREE.Vector3(-0.2, 1.4, 0.8),
        new THREE.Vector3(0.8, 1.25, 0.4),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.7, 1.2, 0.4),
        new THREE.Vector3(1.3, 1.15, 0.2),
        new THREE.Vector3(2.2, 1.1, -0.2),
        new THREE.Vector3(2.8, 0.9, -0.2),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(2.8, 0.9, -0.2),
        new THREE.Vector3(2.6, 0.8, -0.4),
        new THREE.Vector3(1.8, 0.5, -0.8),
        new THREE.Vector3(1.1, 0.2, -0.3),
      ]),
    ];

    const particles = [];
    curves.forEach((curve, curveIndex) => {
      for (let i = 0; i < 70; i += 1) {
        particles.push({
          curve,
          offset: (i / 70) + curveIndex * 0.12,
          phase: i * 0.13 + curveIndex,
        });
      }
    });

    return particles;
  }, []);

  const positions = useMemo(() => new Float32Array(particleData.length * 3), [particleData.length]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    const baseSpeed = reduced ? 0.01 : 0.028;

    particleData.forEach((particle, index) => {
      const t = (particle.offset + (time * baseSpeed + particle.phase) % 1) % 1;
      const point = particle.curve.getPointAt(t);
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.12;
    state.invalidate();
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={particleData.length}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#6ee7ff"
        size={0.08}
        transparent
        opacity={0.9}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
