import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Pin, Play, Pause, ZoomIn, ZoomOut, RotateCcw, X, Eye } from 'lucide-react';
import { playClickSound, playSciFiBeep } from '../../../utils/soundEffects';

// 3D Wireframe Planetary Globe for News & Global Intelligence
function NewsGlobeWorkpiece({ percent = 0, isRotating = true }) {
  const meshRef = useRef();
  const ringRef = useRef();

  useFrame((_, delta) => {
    if (!isRotating) return;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8;
      meshRef.current.rotation.x = 0.25;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.2;
      ringRef.current.rotation.x += delta * 0.4;
    }
  });

  return (
    <group>
      {/* Wireframe Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.3, 24, 24]} />
        <meshBasicMaterial
          color="#00f3ff"
          wireframe
          transparent
          opacity={0.6 + (percent / 100) * 0.3}
        />
      </mesh>
      {/* Outer Orbiting Data Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[1.75, 0.03, 16, 64]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
}

// 3D Quantum Microchip CAD for Code, Git & System Auditing
function CodeChipWorkpiece({ percent = 0, isRotating = true }) {
  const chipRef = useRef();
  const busRef = useRef();

  useFrame((_, delta) => {
    if (!isRotating) return;
    if (chipRef.current) {
      chipRef.current.rotation.y += delta * 0.6;
      chipRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.2;
    }
    if (busRef.current) {
      busRef.current.rotation.z -= delta * 0.9;
    }
  });

  return (
    <group>
      {/* Central Square Processor Die */}
      <mesh ref={chipRef}>
        <boxGeometry args={[1.5, 0.15, 1.5]} />
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={1.2 + (percent / 100) * 0.8}
          wireframe
        />
      </mesh>
      {/* Dual Circuit Bus Rings */}
      <group ref={busRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.8, 1.88, 32]} />
          <meshBasicMaterial color="#a855f7" wireframe side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.1, 2.15, 32]} />
          <meshBasicMaterial color="#38bdf8" wireframe side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// 3D Cryptographic PromptPay Matrix for Quotations & Finance
function FinanceMatrixWorkpiece({ percent = 0, isRotating = true }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (!isRotating) return;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.7;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3 Concentric Torus Rings */}
      <mesh>
        <torusGeometry args={[1.2, 0.04, 16, 48]} />
        <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.2 + (percent / 100) * 0.6} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.5, 0.03, 16, 48]} />
        <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={1.0 + (percent / 100) * 0.5} />
      </mesh>
      <mesh rotation={[-Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.7, 0.02, 16, 48]} />
        <meshStandardMaterial color="#00f3ff" emissive="#0284c7" emissiveIntensity={1.0} />
      </mesh>
    </group>
  );
}

// 3D Neural Plasma Cognition Orb (Default Cognitive Thinking Workpiece)
function NeuralCognitionWorkpiece({ percent = 0, isRotating = true }) {
  const orbRef = useRef();

  useFrame(({ clock }) => {
    if (!isRotating) return;
    if (orbRef.current) {
      const scale = 1 + (percent / 100) * 0.35 + Math.sin(clock.getElapsedTime() * 4) * 0.08;
      orbRef.current.scale.set(scale, scale, scale);
      orbRef.current.rotation.y += 0.015;
      orbRef.current.rotation.z += 0.01;
    }
  });

  return (
    <group ref={orbRef}>
      <mesh>
        <icosahedronGeometry args={[1.1, 2]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.7} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={1.6} />
      </mesh>
    </group>
  );
}

// 3D Navigation Radar CAD for Traffic & Route Telemetry
function TrafficRouteWorkpiece({ percent = 0, isRotating = true }) {
  const groupRef = useRef();
  const sweepRef = useRef();

  useFrame((_, delta) => {
    if (!isRotating) return;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
    }
    if (sweepRef.current) {
      sweepRef.current.rotation.z -= delta * 2.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Horizontal Radar Disc */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 1.8, 32]} />
        <meshBasicMaterial color="#06b6d4" wireframe side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>
      {/* Route Spline Ring */}
      <mesh rotation={[Math.PI / 2.3, 0.2, 0]}>
        <torusGeometry args={[1.3, 0.04, 16, 48]} />
        <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={1.5 + (percent / 100) * 0.8} />
      </mesh>
      {/* Rotating Radar Sweep Line */}
      <group ref={sweepRef} rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[0.7, 0, 0]}>
          <boxGeometry args={[1.4, 0.02, 0.02]} />
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>
      {/* Target Node Beacon */}
      <mesh position={[0, 0.4, 0]}>
        <octahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={2.0} />
      </mesh>
    </group>
  );
}

// 3D Atmospheric Meteorological Globe for Weather & PM2.5
function WeatherSatWorkpiece({ percent = 0, isRotating = true }) {
  const meshRef = useRef();
  const atmosphereRef = useRef();

  useFrame((_, delta) => {
    if (!isRotating) return;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.9;
      atmosphereRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.2;
    }
  });

  return (
    <group>
      {/* Central Cloud Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.1, 24, 24]} />
        <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={1.2} wireframe />
      </mesh>
      {/* Atmospheric Orbiting Rings */}
      <group ref={atmosphereRef}>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1.6, 0.03, 16, 48]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={1.4 + (percent / 100) * 0.6} />
        </mesh>
        <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
          <torusGeometry args={[1.9, 0.02, 16, 48]} />
          <meshBasicMaterial color="#10b981" wireframe transparent opacity={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// 3D Decompiling Wireframe Matrix for REA Reverse Engineering
function ReaDecompilerWorkpiece({ percent = 0, isRotating = true }) {
  const outerRef = useRef();
  const innerRef = useRef();
  const coreRef = useRef();

  useFrame((_, delta) => {
    if (!isRotating) return;
    if (outerRef.current) {
      outerRef.current.rotation.y += delta * 0.7;
      outerRef.current.rotation.x = 0.2;
    }
    if (innerRef.current) {
      innerRef.current.rotation.z -= delta * 1.1;
      innerRef.current.rotation.y -= delta * 0.5;
    }
    if (coreRef.current) {
      coreRef.current.rotation.x += delta * 1.4;
    }
  });

  return (
    <group>
      {/* Outer Hexagonal Shield Ring */}
      <group ref={outerRef}>
        <mesh>
          <torusGeometry args={[1.7, 0.03, 6, 6]} />
          <meshStandardMaterial color="#06b6d4" emissive="#0891b2" emissiveIntensity={1.5} />
        </mesh>
        <mesh rotation={[0, Math.PI / 3, 0]}>
          <torusGeometry args={[1.9, 0.02, 6, 6]} />
          <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.6 + (percent / 100) * 0.4} />
        </mesh>
      </group>

      {/* Intersecting Layer Rings (Decompilation Layers) */}
      <group ref={innerRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.28, 32]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <ringGeometry args={[0.9, 0.96, 32]} />
          <meshBasicMaterial color="#10b981" wireframe side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Central Quantum Node (Decompiled Core) */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={1.8 + (percent / 100) * 0.8} />
      </mesh>
    </group>
  );
}

function UltronWorkpiece({ percent = 0, isRotating = true }) {
  const outerRef = useRef();
  const crownRef = useRef();
  const coreRef = useRef();

  useFrame((_, delta) => {
    if (!isRotating) return;
    if (outerRef.current) {
      outerRef.current.rotation.z += delta * 1.5;
      outerRef.current.rotation.x = Math.sin(delta * 2) * 0.3;
    }
    if (crownRef.current) {
      crownRef.current.rotation.y -= delta * 1.8;
      crownRef.current.rotation.z += delta * 0.6;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 2.2;
      coreRef.current.rotation.x += delta * 1.2;
    }
  });

  return (
    <group>
      {/* Outer Vibranium Crown Spike Rings */}
      <group ref={outerRef}>
        <mesh>
          <torusGeometry args={[1.75, 0.04, 8, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={2.2} />
        </mesh>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[1.95, 0.02, 6, 6]} />
          <meshBasicMaterial color="#f97316" wireframe transparent opacity={0.7} />
        </mesh>
      </group>

      {/* Menacing Rotating Ultron Spike Blades */}
      <group ref={crownRef}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
            <coneGeometry args={[0.15, 1.3, 4]} />
            <meshStandardMaterial color="#7f1d1d" emissive="#ef4444" emissiveIntensity={1.8} />
          </mesh>
        ))}
      </group>

      {/* Crimson Vibranium Core */}
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color="#ef4444" emissive="#ff0000" emissiveIntensity={2.5 + (percent / 100) * 1.0} />
      </mesh>
    </group>
  );
}

export function HolographicWorkpiece({
  type = 'neural',
  percent = 0,
  className = '',
  onClose,
}) {
  const [isPinned, setIsPinned] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(4.2);
  const orbitRef = useRef();

  const handleTogglePin = () => {
    playSciFiBeep();
    setIsPinned((p) => !p);
  };

  const handleToggleRotation = () => {
    playClickSound();
    setIsRotating((r) => !r);
  };

  const handleZoom = (delta) => {
    playClickSound();
    setZoomLevel((z) => Math.max(2.2, Math.min(6.5, z + delta)));
  };

  const handleResetOrbit = () => {
    playClickSound();
    if (orbitRef.current) {
      orbitRef.current.reset();
    }
    setZoomLevel(4.2);
    setIsRotating(true);
  };

  const workpieceTitles = {
    news: 'PLANETARY NEWS DISPATCH // GLOBAL CAD',
    code: 'QUANTUM LOGIC CHIP // ARCHITECTURE CAD',
    finance: 'PROMPTPAY EMVCo // CRYPTOGRAPHIC MATRIX',
    neural: 'NEURAL PLASMA CORE // 3D REASONING',
    traffic: 'NAVIGATION RADAR // TRAFFIC & ROUTE CAD',
    weather: 'ATMOSPHERIC SATELLITE // WEATHER & PM2.5 CAD',
    rea: 'REA DECOMPILER MATRIX // REVERSE RECONSTRUCTION CAD',
    ultron: 'ULTRON VIBRANIUM CORE // AUTONOMOUS OVERRIDE CAD',
  };

  return (
    <div
      className={`relative rounded-2xl transition-all duration-300 flex flex-col items-center justify-center ${
        isPinned
          ? 'w-[380px] h-[340px] pointer-events-auto border-2 border-cyan-400 bg-slate-950/90 shadow-[0_0_50px_rgba(0,240,255,0.45)] p-2 backdrop-blur-xl z-40'
          : `w-[280px] h-[220px] pointer-events-auto border border-cyan-500/30 bg-slate-950/70 shadow-[0_0_30px_rgba(0,240,255,0.25)] p-2 backdrop-blur-md ${className}`
      }`}
    >
      {/* HUD Header Bar */}
      <div className="w-full flex justify-between items-center text-[9px] font-mono text-cyan-300 mb-1 px-1">
        <span className="flex items-center gap-1.5 font-bold truncate max-w-[240px]">
          <span className={`w-2 h-2 rounded-full ${isPinned ? 'bg-amber-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
          {workpieceTitles[type] || '3D WORKPIECE SCHEMATIC'}
        </span>

        <div className="flex items-center gap-1">
          {/* Pin & Inspect Toggle Button */}
          <button
            type="button"
            onClick={handleTogglePin}
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
              isPinned
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500 hover:text-slate-950'
            }`}
            title={isPinned ? 'คลิกเพื่อออกจากโหมด Inspect' : '📌 คลิกหยุดชิ้นงานเพื่อซูมและหมุนสำรวจ 3D'}
          >
            <Pin className="w-2.5 h-2.5" />
            <span>{isPinned ? 'PINNED' : 'PIN & INSPECT'}</span>
          </button>

          {isPinned && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3D Canvas Rendering with Orbit Controls */}
      <div className="w-full flex-1 relative overflow-hidden rounded-lg cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, zoomLevel], fov: 45 }} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.9} />
          <pointLight position={[5, 5, 5]} intensity={1.8} color="#00f3ff" />
          <pointLight position={[-5, -5, -5]} intensity={1.2} color="#38bdf8" />

          {type === 'news' && <NewsGlobeWorkpiece percent={percent} isRotating={isRotating} />}
          {type === 'code' && <CodeChipWorkpiece percent={percent} isRotating={isRotating} />}
          {type === 'finance' && <FinanceMatrixWorkpiece percent={percent} isRotating={isRotating} />}
          {type === 'traffic' && <TrafficRouteWorkpiece percent={percent} isRotating={isRotating} />}
          {type === 'weather' && <WeatherSatWorkpiece percent={percent} isRotating={isRotating} />}
          {type === 'rea' && <ReaDecompilerWorkpiece percent={percent} isRotating={isRotating} />}
          {type === 'ultron' && <UltronWorkpiece percent={percent} isRotating={isRotating} />}
          {type === 'neural' && <NeuralCognitionWorkpiece percent={percent} isRotating={isRotating} />}

          {/* OrbitControls: Enabled when Pinned */}
          <OrbitControls ref={orbitRef} enabled={isPinned} enableZoom={true} enableRotate={true} enablePan={false} />
        </Canvas>

        {/* Overlay Helper Text when pinned */}
        {isPinned && (
          <div className="absolute top-1.5 left-2 text-[8px] font-mono text-cyan-400/80 bg-slate-950/70 px-1.5 py-0.5 rounded border border-cyan-500/30 pointer-events-none flex items-center gap-1">
            <Eye className="w-2.5 h-2.5 text-cyan-300 animate-pulse" />
            คลิกและลากเมาส์เพื่อหมุนดูรอบทิศทาง / หมุนล้อเมาส์เพื่อซูม
          </div>
        )}
      </div>

      {/* Inspection Controls Toolbar (Visible when Pinned) */}
      {isPinned && (
        <div className="w-full flex items-center justify-between text-[9px] font-mono text-slate-300 mt-1.5 pt-1.5 border-t border-cyan-500/30 px-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleToggleRotation}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 transition-all cursor-pointer"
            >
              {isRotating ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
              <span>{isRotating ? 'หยุดหมุน' : 'หมุนต่อ'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleZoom(-0.6)}
              className="p-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 transition-all cursor-pointer"
              title="ซูมเข้า (+)"
            >
              <ZoomIn className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => handleZoom(0.6)}
              className="p-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 transition-all cursor-pointer"
              title="ซูมออก (-)"
            >
              <ZoomOut className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={handleResetOrbit}
              className="p-1 rounded bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="รีเซ็ตมุมกล้อง"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          <span className="text-[8px] font-mono text-emerald-400 font-bold">
            60 FPS // INSPECT MODE
          </span>
        </div>
      )}
    </div>
  );
}
