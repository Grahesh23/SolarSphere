import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function createCellTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0a1f52');
  gradient.addColorStop(0.5, '#12328a');
  gradient.addColorStop(1, '#0a1f52');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cellWidth = canvas.width / 10;
  const cellHeight = canvas.height / 6;

  for (let r = 0; r < 6; r += 1) {
    for (let c = 0; c < 10; c += 1) {
      const x = c * cellWidth;
      const y = r * cellHeight;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 8, y + 8, cellWidth - 16, cellHeight - 16);
    }
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.38)';
  ctx.lineWidth = 3;
  for (let i = 0; i <= 10; i += 1) {
    const x = i * cellWidth;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= 6; i += 1) {
    const y = i * cellHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function createStarburstTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const cx = 256;
  const cy = 256;
  const maxRadius = 220;

  const glow = ctx.createRadialGradient(cx, cy, 16, cx, cy, 230);
  glow.addColorStop(0, 'rgba(255,245,200,1)');
  glow.addColorStop(0.2, 'rgba(255,210,120,0.92)');
  glow.addColorStop(0.55, 'rgba(255,172,60,0.30)');
  glow.addColorStop(1, 'rgba(255,172,60,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 16; i += 1) {
    const angle = (i / 16) * Math.PI * 2;
    const inner = 40;
    const outer = maxRadius;
    const mid = outer * 0.62;
    const x1 = cx + Math.cos(angle) * inner;
    const y1 = cy + Math.sin(angle) * inner;
    const x2 = cx + Math.cos(angle + 0.12) * mid;
    const y2 = cy + Math.sin(angle + 0.12) * mid;
    const x3 = cx + Math.cos(angle) * outer;
    const y3 = cy + Math.sin(angle) * outer;
    const x4 = cx + Math.cos(angle - 0.12) * mid;
    const y4 = cy + Math.sin(angle - 0.12) * mid;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,207,120,0.35)' : 'rgba(255,176,80,0.18)';
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createHaloTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,245,200,1)');
  grad.addColorStop(0.25, 'rgba(255,215,120,0.9)');
  grad.addColorStop(0.52, 'rgba(255,170,80,0.22)');
  grad.addColorStop(1, 'rgba(255,170,80,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createBeamTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(0.15, 'rgba(255,228,150,0.42)');
  grad.addColorStop(0.5, 'rgba(255,206,110,0.65)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function Platform() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[4.4, 64]} />
        <meshStandardMaterial color="#0b1525" metalness={0.35} roughness={0.8} />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]} receiveShadow>
        <torusGeometry args={[4.1, 0.08, 16, 128]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={1.0} />
      </mesh>
    </group>
  );
}

function Sun({ reduced }) {
  const starRef = useRef();
  const haloRef = useRef();
  const starTexture = useMemo(() => createStarburstTexture(), []);
  const haloTexture = useMemo(() => createHaloTexture(), []);
  const beamTexture = useMemo(() => createBeamTexture(), []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (starRef.current) {
      starRef.current.material.rotation = reduced ? 0 : t * 0.02;
      const pulse = reduced ? 0.68 : 0.55 + (Math.sin(t * 1.8) + 1) * 0.13;
      starRef.current.material.opacity = pulse;
    }
    if (haloRef.current) {
      haloRef.current.material.opacity = reduced ? 0.48 : 0.5 + (Math.sin(t * 1.2) + 1) * 0.15;
    }
  });

  const beamData = [
    { position: [0.3, 0.12, -0.1], scale: [1.5, 0.7, 1], opacity: 0.06 },
    { position: [0.7, 0.32, 0.12], scale: [1.8, 0.9, 1], opacity: 0.08 },
    { position: [1.0, 0.5, 0.32], scale: [2.2, 1.1, 1], opacity: 0.1 },
  ];

  return (
    <group position={[0, 0, 0]} scale={[0.72, 0.72, 0.72]}>
      <sprite ref={haloRef} scale={[2.4, 2.4, 1]} renderOrder={10}>
        <spriteMaterial
          map={haloTexture}
          color="#ffd98a"
          transparent
          opacity={0.65}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      <sprite ref={starRef} scale={[3.2, 3.2, 1]} renderOrder={11}>
        <spriteMaterial
          map={starTexture}
          color="#fff4bb"
          transparent
          opacity={0.75}
          depthWrite={false}
          depthTest={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>

      <mesh position={[0.15, 0.12, 0.1]} renderOrder={12}>
        <sphereGeometry args={[0.5, 30, 30]} />
        <meshStandardMaterial color="#ffb34a" emissive="#ffbf5d" emissiveIntensity={2.8} />
      </mesh>

      {beamData.map((beam, index) => (
        <sprite key={index} position={beam.position} scale={beam.scale} renderOrder={9}>
          <spriteMaterial
            map={beamTexture}
            color="#ffe7a7"
            transparent
            opacity={beam.opacity}
            depthWrite={false}
            depthTest={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </sprite>
      ))}

      <pointLight position={[0.15, 0.12, 0.1]} color="#ffd77a" intensity={reduced ? 6 : 9} distance={18} />
    </group>
  );
}

function SolarPanel({ cellTexture, index, position, rotation }) {
  const glintRef = useRef();

  useFrame((state) => {
    if (!glintRef.current) return;
    const t = state.clock.getElapsedTime();
    glintRef.current.position.x = -0.25 + ((Math.sin(t * 0.8 + index) + 1) * 0.5) * 0.57;
    glintRef.current.material.opacity = 0.08 + (Math.sin(t * 0.8 + index) + 1) * 0.08;
  });

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.96, 0.04, 0.62]} />
        <meshStandardMaterial color="#8a99b0" metalness={0.85} roughness={0.35} />
      </mesh>

      <mesh position={[0, 0.028, 0]} castShadow receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.88, 0.54]} />
        <meshPhysicalMaterial
          map={cellTexture}
          color="#dfeeff"
          metalness={0.35}
          roughness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={0.4}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      <mesh ref={glintRef} position={[-0.2, 0.04, 0]} rotation={[0, 0, -0.36]}>
        <planeGeometry args={[0.42, 0.18]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

function RoofPanels() {
  const cellTexture = useMemo(() => createCellTexture(), []);

  const panels = useMemo(() => {
    const items = [];
    const rows = 2;
    const cols = 4;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = -1.58 + col * 0.92 + (row === 1 ? 0.08 : 0);
        const z = -0.82 + row * 0.9;
        items.push({
          position: [x, 0.1 + row * 0.04, z],
          rotation: [0, 0, 0],
        });
      }
    }

    return items;
  }, []);

  return (
    <group position={[0, 2.7, 0.25]} rotation={[0.72, 0, 0]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.3, 0.18, 2.9]} />
        <meshStandardMaterial color="#2a3445" roughness={0.78} metalness={0.48} />
      </mesh>

      {panels.map((panel, index) => (
        <SolarPanel
          key={index}
          index={index}
          cellTexture={cellTexture}
          position={panel.position}
          rotation={panel.rotation}
        />
      ))}

      <mesh position={[0.12, 0.23, -1.15]} rotation={[-0.15, 0.18, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 1.7, 12]} />
        <meshStandardMaterial color="#8ae3ff" emissive="#8ae3ff" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-0.38, 0.24, -1.05]} rotation={[-0.12, 0.18, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 1.7, 12]} />
        <meshStandardMaterial color="#8ae3ff" emissive="#8ae3ff" emissiveIntensity={1.2} />
      </mesh>
    </group>
  );
}

function House() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.8, 1.8, 3.3]} />
        <meshStandardMaterial color="#f5f2ec" roughness={0.75} metalness={0.1} />
      </mesh>

      <mesh position={[0, 2.15, -0.15]} castShadow>
        <boxGeometry args={[5.2, 1.2, 2.6]} />
        <meshStandardMaterial color="#f8f5f0" roughness={0.75} metalness={0.08} />
      </mesh>

      <mesh position={[0, 1.85, 1.8]} castShadow>
        <boxGeometry args={[5.5, 0.18, 0.2]} />
        <meshStandardMaterial color="#b7784b" roughness={0.85} />
      </mesh>

      <mesh position={[0, 1.15, 1.8]} castShadow>
        <boxGeometry args={[5.2, 0.08, 0.16]} />
        <meshStandardMaterial color="#d7c7b5" roughness={0.7} />
      </mesh>

      {[
        [-1.7, 1.05, 1.75, 0.95],
        [-0.4, 1.05, 1.75, 0.95],
        [0.9, 1.05, 1.75, 0.95],
        [2.2, 1.05, 1.75, 0.95],
        [-1.7, 2.3, 1.68, 0.8],
        [-0.4, 2.3, 1.68, 0.8],
        [0.9, 2.3, 1.68, 0.8],
        [2.2, 2.3, 1.68, 0.8],
      ].map(([x, y, z, size], index) => (
        <mesh key={index} position={[x, y, z]} castShadow>
          <boxGeometry args={[size, size * 0.9, 0.13]} />
          <meshStandardMaterial color="#1a233b" emissive="#f7bb6d" emissiveIntensity={0.2} />
        </mesh>
      ))}

      <mesh position={[0, 1.2, 1.77]} castShadow>
        <boxGeometry args={[3.1, 1.3, 0.14]} />
        <meshStandardMaterial color="#d0d8e6" metalness={0.5} roughness={0.32} />
      </mesh>

      <mesh position={[2.8, 0.9, 0.1]} castShadow>
        <boxGeometry args={[0.9, 0.5, 2.1]} />
        <meshStandardMaterial color="#f4eee6" roughness={0.7} />
      </mesh>

      <mesh position={[-2.75, 1.0, 0.2]} castShadow>
        <boxGeometry args={[0.3, 1.3, 1.6]} />
        <meshStandardMaterial color="#d9d2ca" roughness={0.7} />
      </mesh>

      <mesh position={[-2.7, 1.8, 0.2]} castShadow>
        <boxGeometry args={[0.2, 0.1, 1.8]} />
        <meshStandardMaterial color="#b37a5b" roughness={0.8} />
      </mesh>

      <group position={[-3.3, 0.45, -0.9]}>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.9, 1.6]} />
          <meshStandardMaterial color="#d9d6d1" roughness={0.7} />
        </mesh>
        <mesh position={[0.75, 0.22, 0]} castShadow>
          <boxGeometry args={[0.28, 0.3, 0.3]} />
          <meshStandardMaterial color="#47d39b" emissive="#47d39b" emissiveIntensity={1.5} />
        </mesh>
      </group>

      <group position={[2.9, 0.55, -0.6]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 1.25, 0.7]} />
          <meshStandardMaterial color="#dfe5ef" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0.82, 0]} castShadow>
          <boxGeometry args={[0.68, 0.12, 0.68]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={1.5} />
        </mesh>
      </group>

      <group position={[3.2, 0.2, 1.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.85, 0.8, 0.45]} />
          <meshStandardMaterial color="#dfe6ee" roughness={0.7} />
        </mesh>
        <mesh position={[-0.15, 0.35, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="#68efc1" emissive="#68efc1" emissiveIntensity={1.8} />
        </mesh>
      </group>
    </group>
  );
}

function Trees() {
  const trees = useMemo(() => [
    [-3.8, 0, -1.5],
    [-2.9, 0, 2.4],
    [3.2, 0, 2.2],
    [3.8, 0, -1.3],
  ], []);

  return (
    <group>
      {trees.map(([x, y, z], index) => (
        <group key={index} position={[x, y, z]}>
          <mesh castShadow position={[0, 0.45, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.9, 8]} />
            <meshStandardMaterial color="#5b3f2d" />
          </mesh>
          <mesh castShadow position={[0, 1.15, 0]}>
            <sphereGeometry args={[0.42, 18, 18]} />
            <meshStandardMaterial color="#3bb36f" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Carport() {
  return (
    <group position={[0, 0, 2.8]}>
      <mesh castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[3.8, 0.18, 1.8]} />
        <meshStandardMaterial color="#dfeaf7" roughness={0.72} />
      </mesh>
      <mesh castShadow position={[0, 0.82, 0]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[3.8, 0.16, 0.26]} />
        <meshStandardMaterial color="#dfeaf7" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-1.5, 0.9, 0.1]}>
        <boxGeometry args={[0.14, 0.9, 0.14]} />
        <meshStandardMaterial color="#7c8ea3" />
      </mesh>
      <mesh castShadow position={[1.5, 0.9, 0.1]}>
        <boxGeometry args={[0.14, 0.9, 0.14]} />
        <meshStandardMaterial color="#7c8ea3" />
      </mesh>
      <mesh castShadow position={[-1.4, 0.06, 0.75]}>
        <boxGeometry args={[1.5, 0.45, 0.7]} />
        <meshStandardMaterial color="#f8f8f6" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function SolarInstallation({ reduced, modelGroupRef, isSunOnly }) {
  if (isSunOnly) {
    return <Sun reduced={reduced} />;
  }

  return (
    <group ref={modelGroupRef} position={[0, 0, 0]}>
      <Platform />
      <House />
      <RoofPanels />
      <Trees />
      <Carport />
      <mesh position={[1.8, 0.8, -3.2]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.25]} />
        <meshStandardMaterial color="#e5edf8" roughness={0.6} />
      </mesh>
    </group>
  );
}
