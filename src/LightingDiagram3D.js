import React, { useEffect, useRef } from "react";

const SUBJ_OFFSETS = {
  "center":      { x: 0,    y: 0 },
  "left":        { x: -45,  y: 0 },
  "right":       { x: 45,   y: 0 },
  "front":       { x: 0,    y: 35 },
  "back":        { x: 0,    y: -35 },
  "front-left":  { x: -38,  y: 28 },
  "front-right": { x: 38,   y: 28 },
  "back-left":   { x: -38,  y: -28 },
  "back-right":  { x: 38,   y: -28 },
};

const LIGHT_COLORS = ["#e8b84b","#5ba8e8","#e85b8a","#4be8aa","#e8784b","#8b5be8","#4be8e8","#e84b4b"];

const AI_NAME_MAP = {
  "key": -45, "fill": 40, "rim": -150, "hair": 175,
  "background": 175, "back": 175, "kicker": 150, "practical": 110,
  "ไฟหลัก": -45, "ไฟเติม": 40, "ไฟขอบ": -150, "ไฟผม": 175,
  "ไฟหลัง": 175, "ไฟฉาก": 175, "ไฟคิก": 150,
};

function isBGLight(light) {
  const n = (light.name || '').toLowerCase();
  return n.includes('bg') || n.includes('background') || n.includes('set light') ||
    n.includes('ฉาก') || light.target_subject_id === null;
}

function getLightType(light) {
  const n = (light.type || light.name || '').toLowerCase();
  if (n.includes('panel') || n.includes('led_panel')) return 'panel';
  if (n.includes('hmi') || n.includes('fresnel')) return 'hmi';
  if (n.includes('softbox')) return 'softbox';
  return 'cob';
}

function getAngleDeg(light, index) {
  if (typeof light.angle_deg === 'number') return light.angle_deg;
  const nameLower = (light.name || '').toLowerCase();
  for (const [key, angle] of Object.entries(AI_NAME_MAP)) {
    if (nameLower.includes(key.toLowerCase())) return angle;
  }
  return [-45, 40, -150, 150, -90, 90, 170, 10][index % 8];
}

export default function LightingDiagram3D({ lights = [], moodColor, subjects = [], imageBase64 = null }) {
  const canvasRef = useRef(null);
  const subjectList = subjects.length > 0 ? subjects : [{ id: 1, label: "Subject", position: "center" }];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const CX = W / 2;
    const CY = H * 0.44;
    const R = Math.min(W, H) * 0.34;

    // สูตรที่ถูกต้อง: 0°=หน้ากล้อง(ล่าง), 180°=หลัง(บน), -90°=ซ้าย, 90°=ขวา
    function lightPos(angleDeg) {
      const rad = angleDeg * Math.PI / 180;
      return {
        x: CX + Math.sin(rad) * R,
        y: CY + Math.cos(rad) * R * 0.72
      };
    }

    function subjPos(position) {
      const off = SUBJ_OFFSETS[position] || { x: 0, y: 0 };
      return {
        x: CX + off.x,
        y: CY + off.y * 0.72
      };
    }

    function drawBG() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0f1318'; ctx.fillRect(0, 0, W, H);
      const vg = ctx.createRadialGradient(CX, CY, R * 0.2, CX, CY, R * 1.5);
      vg.addColorStop(0, 'transparent'); vg.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    }

    function drawGrid() {
      // Rings
      [0.35, 0.65, 1.0].forEach((f, i) => {
        ctx.beginPath(); ctx.ellipse(CX, CY, R * f, R * f * 0.72, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(40,80,130,${0.15 + i * 0.05})`; ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
      });
      // Range labels
      const ranges = ['1m', '2m', '3m'];
      [0.35, 0.65, 1.0].forEach((f, i) => {
        ctx.font = '8px monospace'; ctx.fillStyle = 'rgba(40,80,130,0.35)'; ctx.textAlign = 'left';
        ctx.fillText(ranges[i], CX + R * f + 3, CY + 3);
      });
      // Axes
      ctx.strokeStyle = 'rgba(40,80,130,0.12)'; ctx.lineWidth = 0.6; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(CX, CY - R * 1.08); ctx.lineTo(CX, CY + R * 1.08); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CX - R * 1.08, CY); ctx.lineTo(CX + R * 1.08, CY); ctx.stroke();
      ctx.setLineDash([]);
      // Direction labels
      ctx.font = '9px monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(40,80,130,0.5)'; ctx.fillText('↑ BACK', CX, CY - R * 1.12);
      ctx.fillStyle = 'rgba(59,130,246,0.55)'; ctx.fillText('↓ CAM', CX, CY + R * 1.15);
      ctx.fillStyle = 'rgba(40,80,130,0.35)'; ctx.textAlign = 'right'; ctx.fillText('L←', CX - R * 1.05, CY + 3);
      ctx.textAlign = 'left'; ctx.fillText('→R', CX + R * 1.05, CY + 3);
    }

    function drawSubject(s) {
      const p = subjPos(s.position);
      const sz = 16;
      // Shadow
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 3, sz * 0.8, sz * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
      // Person
      ctx.strokeStyle = '#4a7a8a'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(p.x, p.y - sz * 0.82, sz * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#1a2a38'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x, p.y - sz * 0.5); ctx.lineTo(p.x, p.y + sz * 0.18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x - sz * 0.36, p.y - sz * 0.22); ctx.lineTo(p.x + sz * 0.36, p.y - sz * 0.22); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + sz * 0.18); ctx.lineTo(p.x - sz * 0.18, p.y + sz * 0.62);
      ctx.moveTo(p.x, p.y + sz * 0.18); ctx.lineTo(p.x + sz * 0.18, p.y + sz * 0.62);
      ctx.stroke();
      // Name
      ctx.font = 'bold 8px -apple-system,sans-serif'; ctx.textAlign = 'center';
      const lw = ctx.measureText(s.label).width + 8;
      ctx.fillStyle = 'rgba(8,14,22,0.9)'; ctx.fillRect(p.x - lw / 2, p.y + sz * 0.68, lw, 12);
      ctx.strokeStyle = 'rgba(60,100,140,0.4)'; ctx.lineWidth = 0.7; ctx.strokeRect(p.x - lw / 2, p.y + sz * 0.68, lw, 12);
      ctx.fillStyle = '#6a9ab0'; ctx.fillText(s.label, p.x, p.y + sz * 0.68 + 9);
      return { x: p.x, y: p.y };
    }

    function drawBeam(lx, ly, tx, ty, color, type) {
      const dx = tx - lx, dy = ty - ly, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1) return;
      const nx = dx / d, ny = dy / d, px = -ny, py = nx;
      const spread = type === 'hmi' ? 0.09 : type === 'panel' ? 0.14 : 0.11;
      for (let i = 5; i >= 0; i--) {
        const alpha = (i / 5) * 0.16, w = spread * d * (i / 5) * 0.4 + 1.5;
        ctx.beginPath();
        ctx.moveTo(lx, ly); ctx.lineTo(tx + px * w, ty + py * w); ctx.lineTo(tx - px * w, ty - py * w);
        ctx.closePath();
        const cg = ctx.createLinearGradient(lx, ly, tx, ty);
        cg.addColorStop(0, color + '00');
        cg.addColorStop(0.4, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        cg.addColorStop(1, color + '04');
        ctx.fillStyle = cg; ctx.fill();
      }
      ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.globalAlpha = 1;
      // Hit glow
      const hg = ctx.createRadialGradient(tx, ty, 0, tx, ty, 18);
      hg.addColorStop(0, color + '38'); hg.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(tx, ty, 18, 0, Math.PI * 2); ctx.fillStyle = hg; ctx.fill();
    }

    function drawLightIcon(x, y, type, color) {
      const s = 11;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, s * 2.2);
      glow.addColorStop(0, color + '28'); glow.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(x, y, s * 2.2, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();

      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([]);

      if (type === 'panel') {
        ctx.fillStyle = '#1a2535'; ctx.fillRect(x - s, y - s * 0.6, s * 2, s * 1.2);
        ctx.strokeRect(x - s, y - s * 0.6, s * 2, s * 1.2);
        [[-0.5, -0.22], [0, -0.22], [0.5, -0.22], [-0.5, 0.14], [0, 0.14], [0.5, 0.14], [-0.5, 0.42], [0, 0.42], [0.5, 0.42]].forEach(([dx, dy]) => {
          ctx.beginPath(); ctx.arc(x + dx * s * 1.3, y + dy * s * 1.2, 1.3, 0, Math.PI * 2);
          ctx.fillStyle = color; ctx.fill();
        });
      } else if (type === 'hmi') {
        ctx.fillStyle = '#1a2535'; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
        [s, s * 0.68, s * 0.38, s * 0.15].forEach(r => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); });
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
        ctx.strokeStyle = color + '55'; ctx.lineWidth = 1; ctx.strokeRect(x - s, y - s, s * 2, s * 2);
      } else {
        ctx.fillStyle = '#1a2535'; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, s * 0.55, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
        ctx.strokeStyle = color + '55'; ctx.lineWidth = 1; ctx.strokeRect(x - s, y - s, s * 2, s * 2);
      }
    }

    function drawCamera() {
      const camY = CY + R * 0.72 + 10;
      const cg = ctx.createRadialGradient(CX, camY + 8, 0, CX, camY + 8, 18);
      cg.addColorStop(0, 'rgba(0,0,0,0.4)'); cg.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.ellipse(CX, camY + 16, 18, 5, 0, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();
      ctx.fillStyle = '#0e1828'; ctx.fillRect(CX - 15, camY, 30, 18);
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2; ctx.strokeRect(CX - 15, camY, 30, 18);
      ctx.beginPath(); ctx.arc(CX, camY + 9, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#0c1e38'; ctx.fill(); ctx.strokeStyle = '#3b82f6'; ctx.stroke();
      ctx.beginPath(); ctx.arc(CX, camY + 9, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#60a5fa'; ctx.fill();
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 1.5; ctx.strokeRect(CX + 10, camY + 2, 7, 5);
      ctx.font = 'bold 8px -apple-system,sans-serif'; ctx.fillStyle = '#3b82f6'; ctx.textAlign = 'center';
      ctx.fillText('CAM', CX, camY + 32);
    }

    function renderAll() {
      drawBG();

      if (imageBase64) {
        // Photo overlay handled separately
      }

      drawGrid();

      // Subjects
      const sp = {};
      subjectList.forEach(s => { sp[s.id] = drawSubject(s); });

      // Beams
      lights.forEach((light, i) => {
        const color = light.color || LIGHT_COLORS[i % LIGHT_COLORS.length];
        const angleDeg = getAngleDeg(light, i);
        const lp = lightPos(angleDeg);
        if (isBGLight(light)) {
          // BG beam to back wall
          const wallY = CY - R * 0.72;
          ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([5, 3]);
          ctx.globalAlpha = 0.3;
          ctx.beginPath(); ctx.moveTo(lp.x, lp.y); ctx.lineTo(CX, wallY); ctx.stroke();
          ctx.globalAlpha = 1; ctx.setLineDash([]);
        } else {
          const target = sp[light.target_subject_id] || sp[1];
          if (target) drawBeam(lp.x, lp.y, target.x, target.y, color, getLightType(light));
        }
      });

      // Light icons + labels
      const labelRects = [];
      lights.forEach((light, i) => {
        const color = light.color || LIGHT_COLORS[i % LIGHT_COLORS.length];
        const angleDeg = getAngleDeg(light, i);
        const lp = lightPos(angleDeg);
        drawLightIcon(lp.x, lp.y, getLightType(light), color);

        // Number
        ctx.font = 'bold 7px monospace'; ctx.fillStyle = color; ctx.textAlign = 'center';
        ctx.fillText(i + 1, lp.x, lp.y + 3);

        // Smart label — ดันออกจากศูนย์กลาง
        const short = (light.name || '').length > 12 ? (light.name || '').substring(0, 12) + '…' : (light.name || '');
        ctx.font = 'bold 8px -apple-system,sans-serif';
        const tw = ctx.measureText(short).width + 10, th = 13;
        const dx = lp.x - CX, dy = lp.y - CY, dd = Math.sqrt(dx * dx + dy * dy) || 1;
        let lx = lp.x + (dx / dd) * 18;
        let ly = lp.y + (dy / dd) * 18 - th / 2;
        lx = Math.max(2, Math.min(W - tw - 2, lx));
        ly = Math.max(2, Math.min(H - th - 2, ly));

        let attempts = 0;
        while (attempts < 8) {
          const collision = labelRects.some(r => lx < r.x + r.w + 3 && lx + tw > r.x - 3 && ly < r.y + r.h + 3 && ly + th > r.y - 3);
          if (!collision) break;
          ly -= th + 3; attempts++;
        }
        labelRects.push({ x: lx, y: ly, w: tw, h: th });

        // Leader line
        ctx.strokeStyle = color + '44'; ctx.lineWidth = 0.7; ctx.setLineDash([2, 2]);
        ctx.beginPath(); ctx.moveTo(lp.x, lp.y); ctx.lineTo(lx + tw / 2, ly + th / 2); ctx.stroke();
        ctx.setLineDash([]);

        // Box
        ctx.fillStyle = 'rgba(8,14,22,0.92)'; ctx.fillRect(lx - 1, ly - 1, tw + 2, th + 2);
        ctx.strokeStyle = color + '66'; ctx.lineWidth = 1; ctx.strokeRect(lx, ly, tw, th);
        ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.fillText(short, lx + 5, ly + 9.5);

        // Angle
        ctx.font = '7px monospace'; ctx.fillStyle = color + '77'; ctx.textAlign = 'center';
        ctx.fillText(`${angleDeg}°`, lp.x, lp.y + 18);
      });

      drawCamera();

      // Title
      ctx.fillStyle = 'rgba(8,12,18,0.75)'; ctx.fillRect(0, 0, W, 22);
      ctx.font = 'bold 9px -apple-system,sans-serif'; ctx.fillStyle = '#2a5a8a'; ctx.textAlign = 'left';
      ctx.fillText('LIGHTING DIAGRAM', 10, 15);
      ctx.font = '8px monospace'; ctx.fillStyle = '#1a3a5a'; ctx.textAlign = 'right';
      ctx.fillText('TOP VIEW', W - 10, 15);
    }

    if (imageBase64) {
      const img = new Image();
      img.onload = () => {
        drawBG();
        const ratio = img.width / img.height;
        const canvasRatio = W / H;
        let drawW, drawH, ox, oy;
        if (ratio > canvasRatio) { drawH = H; drawW = drawH * ratio; ox = (W - drawW) / 2; oy = 0; }
        else { drawW = W; drawH = drawW / ratio; ox = 0; oy = (H - drawH) / 2; }
        ctx.globalAlpha = 0.4; ctx.drawImage(img, ox, oy, drawW, drawH); ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(8,12,18,0.5)'; ctx.fillRect(0, 0, W, H);
        renderAll();
      };
      img.src = `data:image/jpeg;base64,${imageBase64}`;
    } else {
      renderAll();
    }

  }, [lights, subjects, imageBase64, subjectList]);

  const legendLights = lights.map((l, i) => ({
    name: l.name, color: l.color || LIGHT_COLORS[i % LIGHT_COLORS.length], isBG: isBGLight(l),
  }));

  return (
    <div style={{ background: "#0f1318", borderRadius: 12, border: "1px solid #1e2d3d", padding: "8px", marginBottom: 16 }}>
      <canvas ref={canvasRef} width={320} height={360} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", marginTop: 8, padding: "0 4px" }}>
        {legendLights.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#0d1520", borderRadius: 4, padding: "3px 8px", border: `1px solid ${l.color}33` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "#7a9ab0", fontFamily: "-apple-system,sans-serif" }}>
              {i + 1}. {(l.name || '').split('/')[0].trim()}{l.isBG ? ' (ส่องฉาก)' : ''}
            </span>
          </div>
        ))}
        {subjectList.map((s, i) => (
          <div key={`s${i}`} style={{ display: "flex", alignItems: "center", gap: 4, background: "#0d1520", borderRadius: 4, padding: "3px 8px", border: "1px solid #2a4a5a44" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4a6a7a", flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "#5a8aaa", fontFamily: "-apple-system,sans-serif" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}