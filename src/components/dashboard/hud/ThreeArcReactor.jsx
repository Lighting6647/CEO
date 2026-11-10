import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Gyro Ring Component
function GyroRing({ radius, tube, speed, color = '#00f3ff', rotationAxis = [1, 0, 0], audioLevel = 0 }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      const dynamicSpeed = speed * (1 + audioLevel * 2.2);
      meshRef.current.rotation.x += rotationAxis[0] * dynamicSpeed * delta;
      meshRef.current.rotation.y += rotationAxis[1] * dynamicSpeed * delta;
      meshRef.current.rotation.z += rotationAxis[2] * dynamicSpeed * delta;

      // Expand ring slightly with loud audio
      const expansion = 1 + audioLevel * 0.12;
      meshRef.current.scale.set(expansion, expansion, expansion);
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[radius, tube, 16, 64]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6 + audioLevel * 1.5}
        roughness={0.2}
        metalness={0.9}
        wireframe={false}
      />
    </mesh>
  );
}

// Glowing Core with Dynamic Audio Pulse
function ReactorCore({ isAlarm = false, audioLevel = 0 }) {
  const coreRef = useRef();
  const primaryColor = isAlarm ? '#ef4444' : '#00f3ff';

  useFrame(({ clock }) => {
    if (coreRef.current) {
      const basePulse = 1 + Math.sin(clock.getElapsedTime() * 3.5) * 0.08;
      const audioBoost = audioLevel * 0.45; // Real-time voice expansion up to +45%
      const scale = basePulse + audioBoost;
      coreRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={coreRef}>
      {/* Central Solid Core */}
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={1.2 + audioLevel * 2.5}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      {/* Translucent Glass Outer Sphere */}
      <mesh>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshPhysicalMaterial
          color={primaryColor}
          transmission={0.9}
          opacity={0.35 + audioLevel * 0.3}
          transparent
          roughness={0.05}
          ior={1.5}
        />
      </mesh>
    </group>
  );
}

// Floating Quantum Orbitals
function OrbitingParticles({ count = 48, radius = 2.4, color = '#38bdf8', audioLevel = 0 }) {
  const pointsRef = useRef();

  const [positions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 0.4;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return [pos];
  }, [count, radius]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      const dynamicRot = delta * (0.35 + audioLevel * 1.5);
      pointsRef.current.rotation.y += dynamicRot;
      pointsRef.current.rotation.x += delta * 0.12;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06 + audioLevel * 0.04}
        color={color}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Main 3D Arc Reactor View
export function ThreeArcReactor({ isAlarm = false, audioLevel = 0, className = '' }) {
  const accentColor = isAlarm ? '#ef4444' : '#00f3ff';
  const secondaryColor = isAlarm ? '#f97316' : '#0284c7';

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      {/* Liquid Glass HUD Backplate */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/[0.04] to-transparent pointer-events-none backdrop-blur-[2px]" />

      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5 + audioLevel * 0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5 + audioLevel * 2.0} color={accentColor} />
        <pointLight position={[-10, -10, -10]} intensity={0.8 + audioLevel * 1.2} color={secondaryColor} />

        <ReactorCore isAlarm={isAlarm} audioLevel={audioLevel} />

        {/* Triple Gimbal Gyroscope Rings */}
        <GyroRing radius={1.4} tube={0.025} speed={0.8} color={accentColor} rotationAxis={[1, 0.4, 0]} audioLevel={audioLevel} />
        <GyroRing radius={1.75} tube={0.022} speed={-0.6} color={secondaryColor} rotationAxis={[0.3, 1, 0.4]} audioLevel={audioLevel} />
        <GyroRing radius={2.1} tube={0.018} speed={0.4} color={accentColor} rotationAxis={[0.5, 0.2, 1]} audioLevel={audioLevel} />

        {/* Quantum Orbital Particles */}
        <OrbitingParticles count={60} radius={2.5} color={accentColor} audioLevel={audioLevel} />
      </Canvas>

      {/* Cybernetic HUD Overlay Corner Accents */}
      <div className="absolute top-2 left-2 text-[9px] font-mono tracking-widest text-cyan-400/70 border-l border-t border-cyan-500/40 pl-1.5 pt-0.5">
        R3F // 3D ARC CORE {audioLevel > 0.05 ? `[ACTIVE: ${(audioLevel * 100).toFixed(0)}%]` : ''}
      </div>
      <div className="absolute bottom-2 right-2 text-[9px] font-mono tracking-widest text-cyan-400/70 border-r border-b border-cyan-500/40 pr-1.5 pb-0.5">
        60 FPS // WEGL 2.0
      </div>
    </div>
  );
}
