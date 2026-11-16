import { useEffect, useRef } from 'react';

/**
 * Cinema-Grade J.A.R.V.I.S. 3D Golden Neural Hologram Sphere
 * Inspired by Avengers: Age of Ultron (Concentric Orbital Shells, Additive Glow, Radial Spokes & Electric Blue Arc).
 */
export function JarvisNeuralSphere({ isAlarm = false, audioLevel = 0, className = 'w-[380px] h-[380px]' }) {
  const canvasRef = useRef(null);
  const audioRef = useRef(audioLevel);
  const alarmRef = useRef(isAlarm);

  useEffect(() => {
    audioRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    alarmRef.current = isAlarm;
  }, [isAlarm]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2 + 10;
    const cy = h / 2;
    const R = Math.min(w, h) * 0.34;

    const N = 280;
    const pts = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const shell = i % 3 === 0 ? 1.06 : i % 3 === 1 ? 0.84 : 0.62;
      pts.push({
        x: Math.cos(theta) * r * shell,
        y: y * shell,
        z: Math.sin(theta) * r * shell,
        bright: i % 4 === 0,
        hasRay: i % 11 === 0,
      });
    }

    function drawLightning(x1, y1, x2, y2, displace, color, width) {
      if (displace < 2) {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return;
      }
      const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displace;
      const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displace;
      drawLightning(x1, y1, midX, midY, displace / 2, color, width);
      drawLightning(midX, midY, x2, y2, displace / 2, color, width);
    }

    let t = 0;
    let rafId = 0;

    function frame() {
      const level = Math.min(1, Math.max(0, Number(audioRef.current) || 0));
      const alarm = Boolean(alarmRef.current);

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      t += 0.012 + level * 0.025 + (alarm ? 0.01 : 0);

      const pulseR = R * (1 + level * 0.08);

      // 1. Volumetric Core Glow
      const coreGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, pulseR * 1.2);
      coreGrad.addColorStop(0, 'rgba(255, 248, 220, 0.95)');
      coreGrad.addColorStop(0.18, alarm ? 'rgba(244, 63, 94, 0.78)' : 'rgba(255, 183, 3, 0.75)');
      coreGrad.addColorStop(0.52, alarm ? 'rgba(225, 29, 72, 0.32)' : 'rgba(234, 88, 12, 0.32)');
      coreGrad.addColorStop(0.85, 'rgba(194, 65, 12, 0.08)');
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // 2. Electric Blue Energy Impact Zone on Left
      const impactX = cx - pulseR * 0.52;
      const impactY = cy + Math.sin(t * 2.5) * 4;
      const blueGrad = ctx.createRadialGradient(impactX, impactY, 2, impactX, impactY, 58);
      blueGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      blueGrad.addColorStop(0.28, 'rgba(56, 189, 248, 0.78)');
      blueGrad.addColorStop(0.65, 'rgba(37, 99, 235, 0.28)');
      blueGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = blueGrad;
      ctx.beginPath();
      ctx.arc(impactX, impactY, 58, 0, Math.PI * 2);
      ctx.fill();

      // 3. Concentric Mechanical Hologram Shells
      const shells = [
        { r: pulseR * 1.04, tilt: 0.12 + t * 0.15, squeeze: 0.96, dash: [24, 8, 6, 8], color: 'rgba(251, 146, 60, 0.65)', lw: 1.8 },
        { r: pulseR * 0.92, tilt: -0.35 - t * 0.22, squeeze: 0.82, dash: [40, 12, 4, 10], color: 'rgba(253, 186, 116, 0.55)', lw: 1.4 },
        { r: pulseR * 0.74, tilt: 0.72 + t * 0.3, squeeze: 0.68, dash: [18, 6], color: 'rgba(254, 215, 170, 0.6)', lw: 1.5 },
        { r: pulseR * 0.48, tilt: -0.9 + t * 0.45, squeeze: 0.9, dash: [14, 5, 3, 5], color: 'rgba(255, 237, 213, 0.75)', lw: 1.6 },
        { r: pulseR * 0.24, tilt: t * 0.7, squeeze: 0.95, dash: [10, 4], color: 'rgba(255, 251, 235, 0.85)', lw: 2.0 },
      ];
      for (const s of shells) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(s.tilt);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.lw;
        ctx.setLineDash(s.dash);
        ctx.beginPath();
        ctx.ellipse(0, 0, s.r, s.r * s.squeeze, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. 3D Rotating Neural Particles + Radial Spokes
      const cosY = Math.cos(t);
      const sinY = Math.sin(t);
      const cosX = Math.cos(t * 0.42);
      const sinX = Math.sin(t * 0.42);

      const proj = pts.map((p) => {
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;
        const scale = 1 / (1 - z2 * 0.28);
        return {
          sx: cx + x1 * pulseR * 0.94 * scale,
          sy: cy + y2 * pulseR * 0.94 * scale,
          z: z2,
          bright: p.bright,
          hasRay: p.hasRay,
        };
      });

      ctx.setLineDash([]);
      for (let i = 0; i < proj.length; i++) {
        const p = proj[i];
        if (p.z < -0.25) continue;
        const alpha = Math.max(0.2, (p.z + 1) / 2);

        if (p.hasRay) {
          ctx.strokeStyle = `rgba(251, 146, 60, ${alpha * 0.35})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(p.sx, p.sy);
          ctx.stroke();
        }

        for (let j = i + 1; j < Math.min(i + 18, proj.length); j++) {
          const q = proj[j];
          if (q.z < -0.2) continue;
          const dx = p.sx - q.sx;
          const dy = p.sy - q.sy;
          const d2 = dx * dx + dy * dy;
          if (d2 < 820) {
            ctx.strokeStyle = `rgba(249, 115, 22, ${0.32 * (1 - d2 / 820)})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.moveTo(p.sx, p.sy);
            ctx.lineTo(q.sx, q.sy);
            ctx.stroke();
          }
        }

        const nearImpact = Math.hypot(p.sx - impactX, p.sy - impactY) < 46;
        ctx.fillStyle = nearImpact
          ? `rgba(125, 211, 252, ${alpha})`
          : p.bright
          ? `rgba(254, 243, 199, ${alpha})`
          : `rgba(249, 115, 22, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.bright ? 2.1 : 1.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Electric Blue Lightning Arc Entering From Left
      const arcStartY = cy + Math.sin(t * 3) * 8;
      drawLightning(6, arcStartY, impactX, impactY, 18 + level * 10, 'rgba(56, 189, 248, 0.88)', 2.2);
      drawLightning(6, arcStartY, impactX, impactY, 12 + level * 6, 'rgba(224, 242, 254, 0.96)', 1.0);

      ctx.globalCompositeOperation = 'source-over';
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={380}
      height={380}
      className={className}
      aria-label="J.A.R.V.I.S. 3D Golden Neural Hologram Sphere"
    />
  );
}
