import React, { useEffect, useRef } from "react";

const SUBJ_POS = {
  "center":      { side: 0,    depth: 0.48 },
  "left":        { side: -0.5, depth: 0.48 },
  "right":       { side: 0.5,  depth: 0.48 },
  "front":       { side: 0,    depth: 0.28 },
  "back":        { side: 0,    depth: 0.68 },
  "front-left":  { side: -0.4, depth: 0.30 },
  "front-right": { side: 0.4,  depth: 0.30 },
  "back-left":   { side: -0.4, depth: 0.65 },
  "back-right":  { side: 0.4,  depth: 0.65 },
};

const LIGHT_COLORS = ["#fbbf24","#60a5fa","#f472b6","#34d399","#f97316","#a78bfa","#06b6d4","#ef4444"];

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

    const BACK_Y = H * 0.22, FLOOR_Y = H * 0.91;
    const BACK_L = W * 0.20, BACK_R = W * 0.80;
    const ROOM_L = 0, ROOM_R = W;

    function wts(side, depth, height = 0) {
      const t = 0.2 + depth * 0.62;
      return {
        x: W / 2 + (side * W * 0.46) * (1 - t * 0.58),
        y: BACK_Y + (FLOOR_Y - BACK_Y) * (1 - depth) - height * H * 0.33 * (1 - depth * 0.20)
      };
    }

    function atw(deg, dist = 0.75) {
      const r = deg * Math.PI / 180;
      return { side: Math.sin(r) * dist * 1.3, depth: Math.max(0.05, Math.min(0.92, (1 - Math.cos(r)) * 0.5 * dist + 0.08)) };
    }

    function drawRoom(hasPhoto = false) {
      const fg = ctx.createLinearGradient(W / 2, BACK_Y, W / 2, FLOOR_Y);
      fg.addColorStop(0, '#0a1020'); fg.addColorStop(1, '#131a28');
ctx.globalAlpha = hasPhoto ? 0.35 : 1;
      ctx.beginPath();
      ctx.moveTo(ROOM_L, FLOOR_Y); ctx.lineTo(BACK_L, BACK_Y); ctx.lineTo(BACK_R, BACK_Y); ctx.lineTo(ROOM_R, FLOOR_Y);
      ctx.closePath(); ctx.fillStyle = fg; ctx.fill();
 ctx.globalAlpha = 1;
      ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1.5; ctx.stroke();

      for (let i = 1; i < 6; i++) {
        const t = i / 6, y = BACK_Y + (FLOOR_Y - BACK_Y) * t;
        const x1 = BACK_L + (ROOM_L - BACK_L) * t, x2 = BACK_R + (ROOM_R - BACK_R) * t;
        ctx.strokeStyle = `rgba(30,80,120,${0.12 + t * 0.22})`; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
      }
      for (let i = 1; i < 7; i++) {
        const t = i / 7, bx = BACK_L + (BACK_R - BACK_L) * t, fx = ROOM_L + (ROOM_R - ROOM_L) * t;
        ctx.strokeStyle = 'rgba(20,60,100,0.2)'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(bx, BACK_Y); ctx.lineTo(fx, FLOOR_Y); ctx.stroke();
      }

      const wg = ctx.createLinearGradient(W / 2, H * 0.02, W / 2, BACK_Y);
      wg.addColorStop(0, '#0c1525'); wg.addColorStop(1, '#0e1a2e');
      ctx.beginPath();
      ctx.moveTo(BACK_L, BACK_Y); ctx.lineTo(BACK_R, BACK_Y); ctx.lineTo(BACK_R, H * 0.02); ctx.lineTo(BACK_L, H * 0.02);
      ctx.closePath(); ctx.fillStyle = wg; ctx.fill(); ctx.strokeStyle = '#2a4a6a'; ctx.lineWidth = 1.5; ctx.stroke();

      for (let i = 1; i < 4; i++) {
        const x = BACK_L + (BACK_R - BACK_L) * i / 4;
        ctx.strokeStyle = 'rgba(30,70,110,0.15)'; ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(x, H * 0.02); ctx.lineTo(x, BACK_Y); ctx.stroke();
      }
      for (let i = 1; i < 3; i++) {
        const y = H * 0.02 + (BACK_Y - H * 0.02) * i / 3;
        ctx.strokeStyle = 'rgba(30,70,110,0.15)'; ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(BACK_L, y); ctx.lineTo(BACK_R, y); ctx.stroke();
      }

      const lw = ctx.createLinearGradient(ROOM_L, 0, BACK_L, 0);
      lw.addColorStop(0, '#050810'); lw.addColorStop(1, '#0a1220');
      ctx.beginPath();
      ctx.moveTo(ROOM_L, FLOOR_Y); ctx.lineTo(BACK_L, BACK_Y); ctx.lineTo(BACK_L, H * 0.02); ctx.lineTo(ROOM_L, H * 0.04);
      ctx.closePath(); ctx.fillStyle = lw; ctx.fill(); ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1; ctx.stroke();

      const rw = ctx.createLinearGradient(BACK_R, 0, ROOM_R, 0);
      rw.addColorStop(0, '#0a1220'); rw.addColorStop(1, '#050810');
      ctx.beginPath();
      ctx.moveTo(ROOM_R, FLOOR_Y); ctx.lineTo(BACK_R, BACK_Y); ctx.lineTo(BACK_R, H * 0.02); ctx.lineTo(ROOM_R, H * 0.04);
      ctx.closePath(); ctx.fillStyle = rw; ctx.fill(); ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1; ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ROOM_L, H * 0.04); ctx.lineTo(BACK_L, H * 0.02); ctx.lineTo(BACK_R, H * 0.02); ctx.lineTo(ROOM_R, H * 0.04);
      ctx.closePath(); ctx.fillStyle = '#08101c'; ctx.fill(); ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1; ctx.stroke();

      ctx.strokeStyle = '#2a4a6a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(BACK_L, BACK_Y); ctx.lineTo(ROOM_L, FLOOR_Y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(BACK_R, BACK_Y); ctx.lineTo(ROOM_R, FLOOR_Y); ctx.stroke();
      ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = '#1e3a5f'; ctx.fillText('↑ ด้านหลัง', W / 2, BACK_Y - 5);
    }

    function drawSubject(s) {
      const pos = SUBJ_POS[s.position] || SUBJ_POS.center;
      const p = wts(pos.side, pos.depth, 0);
      const sc = 0.52 + (1 - pos.depth) * 0.48;
      const sz = 24 * sc;

      const sg = ctx.createRadialGradient(p.x, p.y + 4, 0, p.x, p.y + 4, sz * 0.9);
      sg.addColorStop(0, 'rgba(0,0,0,0.55)'); sg.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 4, sz * 0.9, sz * 0.25, 0, 0, Math.PI * 2);
      ctx.fillStyle = sg; ctx.fill();

      ctx.strokeStyle = '#5a7a8a'; ctx.lineWidth = 2 * sc; ctx.lineCap = 'round'; ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(p.x, p.y - sz * 0.95, sz * 0.36, 0, Math.PI * 2);
      ctx.fillStyle = '#0d1a28'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x, p.y - sz * 0.58); ctx.lineTo(p.x, p.y + sz * 0.22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x - sz * 0.42, p.y - sz * 0.30); ctx.lineTo(p.x + sz * 0.42, p.y - sz * 0.30); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x - sz * 0.42, p.y - sz * 0.30); ctx.lineTo(p.x - sz * 0.48, p.y + sz * 0.12);
      ctx.moveTo(p.x + sz * 0.42, p.y - sz * 0.30); ctx.lineTo(p.x + sz * 0.48, p.y + sz * 0.12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + sz * 0.22); ctx.lineTo(p.x - sz * 0.22, p.y + sz * 0.75);
      ctx.moveTo(p.x, p.y + sz * 0.22); ctx.lineTo(p.x + sz * 0.22, p.y + sz * 0.75);
      ctx.stroke();

      ctx.font = `bold ${9 * sc}px monospace`; ctx.textAlign = 'center';
      const lw2 = ctx.measureText(s.label).width + 12, lx = p.x - lw2 / 2, ly = p.y + sz * 0.82;
      ctx.fillStyle = '#0a1018'; ctx.fillRect(lx, ly, lw2, 13 * sc);
      ctx.strokeStyle = '#2a4a5a'; ctx.lineWidth = 0.8; ctx.strokeRect(lx, ly, lw2, 13 * sc);
      ctx.fillStyle = '#7a9ab0'; ctx.fillText(s.label, p.x, ly + 9 * sc);
      return { screenX: p.x, screenY: p.y - sz * 0.2 };
    }

    function drawLightBeam(lx, ly, tx, ty, color, lightType) {
      const dx = tx - lx, dy = ty - ly, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1) return;
      const nx = dx / d, ny = dy / d, px = -ny, py = nx;
      const spread = lightType === 'hmi' ? 0.12 : lightType === 'panel' ? 0.22 : 0.18;
      for (let i = 8; i >= 0; i--) {
        const alpha = (i / 8) * 0.18, w = spread * d * (i / 8) * 0.5 + 2;
        ctx.beginPath();
        ctx.moveTo(lx, ly); ctx.lineTo(tx + px * w, ty + py * w); ctx.lineTo(tx - px * w, ty - py * w);
        ctx.closePath();
        const cg = ctx.createLinearGradient(lx, ly, tx, ty);
        cg.addColorStop(0, color + '00');
        cg.addColorStop(0.3, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        cg.addColorStop(1, color + '08');
        ctx.fillStyle = cg; ctx.fill();
      }
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([]);
      ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.globalAlpha = 1;
      const edgeW = spread * d * 0.4;
      ctx.strokeStyle = color; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.3;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(tx + px * edgeW, ty + py * edgeW); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(tx - px * edgeW, ty - py * edgeW); ctx.stroke();
      ctx.globalAlpha = 1;
      const hg = ctx.createRadialGradient(tx, ty, 0, tx, ty, 28);
      hg.addColorStop(0, color + '55'); hg.addColorStop(0.5, color + '22'); hg.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(tx, ty, 28, 0, Math.PI * 2); ctx.fillStyle = hg; ctx.fill();
      const fg2 = ctx.createRadialGradient(tx, ty + 40, 0, tx, ty + 40, 35);
      fg2.addColorStop(0, color + '20'); fg2.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.ellipse(tx, ty + 40, 35, 12, 0, 0, Math.PI * 2); ctx.fillStyle = fg2; ctx.fill();
    }

    function drawBGBeam(lx, ly, color) {
      const wx = lx + (W / 2 - lx) * 0.3, wy = BACK_Y + 18;
      const dx = wx - lx, dy = wy - ly, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1) return;
      const nx = dx / d, ny = dy / d, px = -ny, py = nx, w = 25;
      ctx.beginPath();
      ctx.moveTo(lx, ly); ctx.lineTo(wx + px * w, wy + py * w); ctx.lineTo(wx - px * w, wy - py * w);
      ctx.closePath();
      const cg = ctx.createLinearGradient(lx, ly, wx, wy);
      cg.addColorStop(0, color + '00'); cg.addColorStop(0.4, color + '18'); cg.addColorStop(1, color + '08');
      ctx.fillStyle = cg; ctx.fill();
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([5, 3]);
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(wx, wy); ctx.stroke();
      ctx.globalAlpha = 1; ctx.setLineDash([]);
    }

    function drawLightIcon(x, y, type, color, sc) {
      ctx.strokeStyle = color; ctx.lineWidth = 1.5 * sc; ctx.setLineDash([]);
      const s = 12 * sc;
      const g = ctx.createRadialGradient(x, y, 0, x, y, s * 2);
      g.addColorStop(0, color + '30'); g.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(x, y, s * 2, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      if (type === 'panel') {
        ctx.strokeRect(x - s, y - s * 0.65, s * 2, s * 1.3);
        ctx.fillStyle = color + '18'; ctx.fillRect(x - s, y - s * 0.65, s * 2, s * 1.3);
        [[-0.5, -0.28], [0, -0.28], [0.5, -0.28], [-0.5, 0.1], [0, 0.1], [0.5, 0.1], [-0.5, 0.42], [0, 0.42], [0.5, 0.42]].forEach(([dx, dy]) => {
          ctx.beginPath(); ctx.arc(x + dx * s * 1.4, y + dy * s * 1.35, 1.4 * sc, 0, Math.PI * 2);
          ctx.fillStyle = color; ctx.fill();
        });
      } else if (type === 'hmi') {
        [s, s * 0.68, s * 0.40, s * 0.16].forEach(r => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); });
        ctx.beginPath(); ctx.arc(x, y, 2.2 * sc, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
        ctx.lineWidth = 1 * sc; ctx.strokeRect(x - s, y - s, s * 2, s * 2);
      } else {
        ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, s * 0.6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 2.5 * sc, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
        ctx.lineWidth = 1 * sc; ctx.strokeRect(x - s, y - s, s * 2, s * 2);
      }
    }

    function drawStand(bx, by, hx, hy) {
      ctx.beginPath(); ctx.ellipse(bx, by + 6, 10, 3, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fill();
      ctx.strokeStyle = '#3a5060'; ctx.lineWidth = 3; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(hx, hy + 14); ctx.stroke();
      ctx.strokeStyle = '#2a4050'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bx - 13, by + 9); ctx.lineTo(bx, by);
      ctx.moveTo(bx + 13, by + 9); ctx.lineTo(bx, by);
      ctx.moveTo(bx, by + 11); ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.beginPath(); ctx.ellipse(bx, by + 6, 11, 4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#4a6070'; ctx.lineWidth = 1; ctx.stroke();
    }

    function drawLabel(x, y, name, color, deg, sc) {
      const short = name.length > 14 ? name.substring(0, 14) + '…' : name;
      ctx.font = `bold ${9 * sc}px monospace`; ctx.textAlign = 'center';
      const tw = ctx.measureText(short).width + 12, lx = x - tw / 2, ly = y - 24 * sc;
      ctx.fillStyle = '#060c14'; ctx.fillRect(lx - 1, ly - 1, tw + 2, 14 * sc + 2);
      ctx.strokeStyle = color + '77'; ctx.lineWidth = 1; ctx.strokeRect(lx, ly, tw, 14 * sc);
      ctx.fillStyle = color; ctx.fillText(short, x, ly + 10 * sc);
      ctx.font = `${7.5 * sc}px monospace`; ctx.fillStyle = color + '99';
      ctx.fillText(`${deg}°`, x, y + 24 * sc);
    }

    function drawCamera() {
      const cp = wts(0, -0.02, 0);
      ctx.beginPath(); ctx.ellipse(cp.x, cp.y + 28, 14, 4, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
      ctx.strokeStyle = '#2a4050'; ctx.lineWidth = 2.5; ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(cp.x - 10, cp.y + 12); ctx.lineTo(cp.x - 16, cp.y + 28);
      ctx.moveTo(cp.x + 10, cp.y + 12); ctx.lineTo(cp.x + 16, cp.y + 28);
      ctx.moveTo(cp.x, cp.y + 12); ctx.lineTo(cp.x, cp.y + 30);
      ctx.stroke();
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.fillStyle = '#0a1830';
      ctx.fillRect(cp.x - 18, cp.y - 12, 36, 22); ctx.strokeRect(cp.x - 18, cp.y - 12, 36, 22);
      ctx.beginPath(); ctx.arc(cp.x, cp.y - 1, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#0d2040'; ctx.fill(); ctx.strokeStyle = '#3b82f6'; ctx.stroke();
      ctx.beginPath(); ctx.arc(cp.x, cp.y - 1, 3, 0, Math.PI * 2); ctx.fillStyle = '#3b82f6'; ctx.fill();
      ctx.strokeRect(cp.x + 10, cp.y - 10, 8, 6);
      ctx.font = 'bold 9px monospace'; ctx.fillStyle = '#3b82f6'; ctx.textAlign = 'center';
      ctx.fillText('CAM', cp.x, cp.y + 42);
    }

    function renderAll() {
      drawRoom(!!imageBase64)
      const sp = {};
      subjectList.forEach(s => { sp[s.id] = drawSubject(s); });

      lights.forEach((light, i) => {
        const color = light.color || LIGHT_COLORS[i % LIGHT_COLORS.length];
        const angleDeg = getAngleDeg(light, i);
        const world = atw(angleDeg, 0.72);
        const hp = wts(world.side, world.depth, 0.78);
        const bg = isBGLight(light);
        if (bg) drawBGBeam(hp.x, hp.y, color);
        else {
          const target = sp[light.target_subject_id] || sp[1];
          if (target) drawLightBeam(hp.x, hp.y, target.screenX, target.screenY, color, getLightType(light));
        }
      });

      lights.forEach((light, i) => {
        const color = light.color || LIGHT_COLORS[i % LIGHT_COLORS.length];
        const angleDeg = getAngleDeg(light, i);
        const world = atw(angleDeg, 0.72);
        const lp = wts(world.side, world.depth, 0);
        const hp = wts(world.side, world.depth, 0.78);
        drawStand(lp.x, lp.y, hp.x, hp.y);
        const sc = 0.60 + (1 - world.depth) * 0.40;
        drawLightIcon(hp.x, hp.y, getLightType(light), color, sc);
        drawLabel(hp.x, hp.y, light.name || '', color, angleDeg, sc);
      });

      drawCamera();
    }

    // RENDER
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, W, H);

    if (imageBase64) {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const drawH = H, drawW = drawH * ratio;
        const ox = (W - drawW) / 2;
        ctx.globalAlpha = 0.45;
        ctx.drawImage(img, ox, 0, drawW, drawH);
        ctx.globalAlpha = 1;
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
    <div style={{ background: "#060a12", borderRadius: 12, border: "1px solid #1e293b", padding: "8px", marginBottom: 16 }}>
      <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 4, textAlign: "center" }}>
        🎬 3D STUDIO — LIGHTING DIAGRAM
      </div>
      <canvas ref={canvasRef} width={320} height={380} style={{ width: "100%", height: "auto", display: "block" }} />
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", marginTop: 8, padding: "0 4px" }}>
        {legendLights.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#0d1117", borderRadius: 4, padding: "3px 7px", border: `1px solid ${l.color}44` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "#94a3b8" }}>{(l.name || '').split('/')[0].trim()}{l.isBG ? ' (ส่องฉาก)' : ''}</span>
          </div>
        ))}
        {subjectList.map((s, i) => (
          <div key={`s${i}`} style={{ display: "flex", alignItems: "center", gap: 4, background: "#0d1117", borderRadius: 4, padding: "3px 7px", border: "1px solid #33415544" }}>
            <div style={{ width: 8, height: 8, borderRadius: 0, background: "#5a7a8a", flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "#7a9ab0" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}