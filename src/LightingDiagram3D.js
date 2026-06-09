import React, { useEffect, useRef } from "react";

const SUBJ_POS = {
  "center":       { side:0,     depth:0.48 },
  "left":         { side:-0.5,  depth:0.48 },
  "right":        { side:0.5,   depth:0.48 },
  "front":        { side:0,     depth:0.28 },
  "back":         { side:0,     depth:0.68 },
  "front-left":   { side:-0.45, depth:0.30 },
  "front-right":  { side:0.45,  depth:0.30 },
  "back-left":    { side:-0.45, depth:0.65 },
  "back-right":   { side:0.45,  depth:0.65 },
};

const LIGHT_COLORS = [
  "#fbbf24","#60a5fa","#f472b6","#34d399","#f97316","#a78bfa","#06b6d4","#ef4444"
];

const AI_NAME_MAP = {
  "key": -45, "fill": 40, "rim": -150, "hair": 175,
  "background": 175, "back": 175, "kicker": 150, "practical": 110,
  "ไฟหลัก": -45, "ไฟเติม": 40, "ไฟขอบ": -150, "ไฟผม": 175,
  "ไฟหลัง": 175, "ไฟฉาก": 175, "ไฟคิก": 150,
};

function isBGLight(light) {
  const n = (light.name || '').toLowerCase();
  return n.includes('bg') || n.includes('background') || n.includes('set light') ||
    n.includes('ฉาก') || n.includes('หลัง') && n.includes('ไฟ') ||
    light.target_subject_id === null;
}

function getLightType(light) {
  const n = (light.type || light.name || '').toLowerCase();
  if (n.includes('panel') || n.includes('led_panel')) return 'led_panel';
  if (n.includes('hmi') || n.includes('fresnel')) return 'hmi';
  if (n.includes('softbox')) return 'softbox';
  if (n.includes('tube')) return 'tube';
  return 'led_cob';
}

function getAngleDeg(light, index) {
  if (typeof light.angle_deg === 'number') return light.angle_deg;
  const nameLower = (light.name || '').toLowerCase();
  for (const [key, angle] of Object.entries(AI_NAME_MAP)) {
    if (nameLower.includes(key.toLowerCase())) return angle;
  }
  const defaults = [-45, 40, -150, 150, -90, 90, 170, 10];
  return defaults[index % defaults.length];
}

export default function LightingDiagram3D({ lights = [], moodColor, subjects = [] }) {
  const canvasRef = useRef(null);
  const subjectList = subjects.length > 0
    ? subjects
    : [{ id: 1, label: "Subject", position: "center" }];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const BACK_Y = H * 0.30;
    const FLOOR_Y = H * 0.92;
    const BACK_LEFT = W * 0.18;
    const BACK_RIGHT = W * 0.82;
    const ROOM_LEFT = W * 0.02;
    const ROOM_RIGHT = W * 0.98;

    function worldToScreen(side, depth, height = 0) {
      const t = 0.25 + depth * 0.55;
      const sx = W / 2 + (side * W * 0.42) * (1 - t * 0.55);
      const sy = BACK_Y + (FLOOR_Y - BACK_Y) * (1 - depth) - height * H * 0.32 * (1 - depth * 0.25);
      return { x: sx, y: sy };
    }

    function angleToWorld(deg, dist = 0.75) {
      const rad = deg * Math.PI / 180;
      const side = Math.sin(rad) * dist * 1.3;
      const rawDepth = (1 - Math.cos(rad)) * 0.5 * dist + 0.08;
      return { side, depth: Math.max(0.05, Math.min(0.92, rawDepth)) };
    }

    function drawRoom() {
      // Floor
      ctx.beginPath();
      ctx.moveTo(ROOM_LEFT, FLOOR_Y); ctx.lineTo(BACK_LEFT, BACK_Y);
      ctx.lineTo(BACK_RIGHT, BACK_Y); ctx.lineTo(ROOM_RIGHT, FLOOR_Y);
      ctx.closePath();
      ctx.fillStyle = '#080c18'; ctx.fill();
      ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1; ctx.stroke();

      ctx.strokeStyle = '#0f2040'; ctx.lineWidth = 0.5;
      for (let i = 1; i < 5; i++) {
        const t = i / 5;
        const y = BACK_Y + (FLOOR_Y - BACK_Y) * t;
        const x1 = BACK_LEFT + (ROOM_LEFT - BACK_LEFT) * t;
        const x2 = BACK_RIGHT + (ROOM_RIGHT - BACK_RIGHT) * t;
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
      }
      for (let i = 1; i < 6; i++) {
        const t = i / 6;
        const bx = BACK_LEFT + (BACK_RIGHT - BACK_LEFT) * t;
        const fx = ROOM_LEFT + (ROOM_RIGHT - ROOM_LEFT) * t;
        ctx.beginPath(); ctx.moveTo(bx, BACK_Y); ctx.lineTo(fx, FLOOR_Y); ctx.stroke();
      }

      // Back wall
      ctx.fillStyle = '#060910';
      ctx.beginPath();
      ctx.moveTo(BACK_LEFT, BACK_Y); ctx.lineTo(BACK_RIGHT, BACK_Y);
      ctx.lineTo(BACK_RIGHT, H * 0.02); ctx.lineTo(BACK_LEFT, H * 0.02);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1; ctx.stroke();

      ctx.strokeStyle = '#0f1f35'; ctx.lineWidth = 0.4;
      for (let i = 1; i < 4; i++) {
        const x = BACK_LEFT + (BACK_RIGHT - BACK_LEFT) * i / 4;
        ctx.beginPath(); ctx.moveTo(x, H * 0.02); ctx.lineTo(x, BACK_Y); ctx.stroke();
      }
      for (let i = 1; i < 3; i++) {
        const y = H * 0.02 + (BACK_Y - H * 0.02) * i / 3;
        ctx.beginPath(); ctx.moveTo(BACK_LEFT, y); ctx.lineTo(BACK_RIGHT, y); ctx.stroke();
      }

      // Left wall
      ctx.fillStyle = '#070a14';
      ctx.beginPath();
      ctx.moveTo(ROOM_LEFT, FLOOR_Y); ctx.lineTo(BACK_LEFT, BACK_Y);
      ctx.lineTo(BACK_LEFT, H * 0.02); ctx.lineTo(ROOM_LEFT, H * 0.04);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 0.8; ctx.stroke();

      // Right wall
      ctx.fillStyle = '#070a14';
      ctx.beginPath();
      ctx.moveTo(ROOM_RIGHT, FLOOR_Y); ctx.lineTo(BACK_RIGHT, BACK_Y);
      ctx.lineTo(BACK_RIGHT, H * 0.02); ctx.lineTo(ROOM_RIGHT, H * 0.04);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 0.8; ctx.stroke();

      // Ceiling
      ctx.fillStyle = '#04060c';
      ctx.beginPath();
      ctx.moveTo(ROOM_LEFT, H * 0.04); ctx.lineTo(BACK_LEFT, H * 0.02);
      ctx.lineTo(BACK_RIGHT, H * 0.02); ctx.lineTo(ROOM_RIGHT, H * 0.04);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 0.8; ctx.stroke();

      // Labels
      ctx.font = '8px monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = '#1e3a5f';
      ctx.fillText('↑ ด้านหลัง', W / 2, BACK_Y - 6);
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('CAM / ด้านหน้า', W / 2, FLOOR_Y + 14);
    }

    function drawSubject(s) {
      const pos = SUBJ_POS[s.position] || SUBJ_POS["center"];
      const p = worldToScreen(pos.side, pos.depth, 0);
      const scale = 0.45 + (1 - pos.depth) * 0.55;
      const sz = 20 * scale;

      ctx.beginPath();
      ctx.ellipse(p.x, p.y + 2, sz * 0.75, sz * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();

      ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5 * scale; ctx.lineCap = 'round';
      ctx.setLineDash([]);

      ctx.beginPath(); ctx.arc(p.x, p.y - sz * 1.0, sz * 0.38, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x, p.y - sz * 0.62); ctx.lineTo(p.x, p.y + sz * 0.22); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x - sz * 0.42, p.y - sz * 0.32); ctx.lineTo(p.x + sz * 0.42, p.y - sz * 0.32); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x - sz * 0.42, p.y - sz * 0.32); ctx.lineTo(p.x - sz * 0.48, p.y + sz * 0.15);
      ctx.moveTo(p.x + sz * 0.42, p.y - sz * 0.32); ctx.lineTo(p.x + sz * 0.48, p.y + sz * 0.15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + sz * 0.22); ctx.lineTo(p.x - sz * 0.22, p.y + sz * 0.75);
      ctx.moveTo(p.x, p.y + sz * 0.22); ctx.lineTo(p.x + sz * 0.22, p.y + sz * 0.75);
      ctx.stroke();

      ctx.font = `${8 * scale}px monospace`; ctx.textAlign = 'center';
      const lw = ctx.measureText(s.label).width + 10;
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(p.x - lw / 2, p.y + sz * 0.8, lw, 13 * scale);
      ctx.strokeStyle = '#33415544'; ctx.lineWidth = 0.8;
      ctx.strokeRect(p.x - lw / 2, p.y + sz * 0.8, lw, 13 * scale);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(s.label, p.x, p.y + sz * 0.8 + 9 * scale);

      return { screenX: p.x, screenY: p.y - sz * 0.3 };
    }

    function drawLightIcon(x, y, type, color, scale = 1) {
      ctx.strokeStyle = color; ctx.lineWidth = 1.5 * scale; ctx.setLineDash([]);
      const s = 13 * scale;

      if (type === 'led_panel') {
        ctx.strokeRect(x - s, y - s * 0.7, s * 2, s * 1.4);
        ctx.fillStyle = color + '15'; ctx.fillRect(x - s, y - s * 0.7, s * 2, s * 1.4);
        [[-0.5,-0.35],[0,-0.35],[0.5,-0.35],[-0.5,0.1],[0,0.1],[0.5,0.1],[-0.5,0.42],[0,0.42],[0.5,0.42]].forEach(([dx, dy]) => {
          ctx.beginPath(); ctx.arc(x + dx * s * 1.4, y + dy * s * 1.5, 1.5 * scale, 0, Math.PI * 2);
          ctx.fillStyle = color; ctx.fill();
        });
      } else if (type === 'hmi') {
        [s, s * 0.7, s * 0.42, s * 0.18].forEach(r => {
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
        });
        ctx.beginPath(); ctx.arc(x, y, 2 * scale, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
        ctx.lineWidth = 1 * scale; ctx.strokeRect(x - s, y - s, s * 2, s * 2);
      } else if (type === 'softbox') {
        const pts = [];
        for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4 - Math.PI / 8;
          pts.push([x + Math.cos(a) * s, y + Math.sin(a) * s * 0.75]);
        }
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        pts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.closePath();
        ctx.fillStyle = color + '10'; ctx.fill(); ctx.stroke();
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath(); ctx.moveTo(x - s + 3, y + i * s * 0.22); ctx.lineTo(x + s - 3, y + i * s * 0.22);
          ctx.globalAlpha = 0.25; ctx.stroke(); ctx.globalAlpha = 1;
        }
      } else {
        ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, s * 0.62, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, s * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = color + '44'; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 2.5 * scale, 0, Math.PI * 2);
        ctx.fillStyle = color; ctx.fill();
        ctx.lineWidth = 1 * scale; ctx.strokeRect(x - s, y - s, s * 2, s * 2);
      }
    }

    function drawStand(bx, by, hx, hy) {
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 2; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(hx, hy + 14); ctx.stroke();
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bx - 10, by + 7); ctx.lineTo(bx, by);
      ctx.moveTo(bx + 10, by + 7); ctx.lineTo(bx, by);
      ctx.moveTo(bx, by + 10); ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.beginPath(); ctx.ellipse(bx, by + 4, 9, 3.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#475569'; ctx.lineWidth = 0.8; ctx.stroke();
    }

    function drawBeam(lx, ly, tx, ty, color) {
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([5, 3]);
      ctx.globalAlpha = 0.5;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.globalAlpha = 1; ctx.setLineDash([]);
      const dx = tx - lx, dy = ty - ly, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1) return;
      const nx = dx / d, ny = dy / d, px = -ny * 18, py = nx * 18;
      ctx.beginPath();
      ctx.moveTo(lx, ly); ctx.lineTo(tx + px, ty + py); ctx.lineTo(tx - px, ty - py);
      ctx.closePath();
      ctx.fillStyle = color; ctx.globalAlpha = 0.06; ctx.fill(); ctx.globalAlpha = 1;
    }

    function drawBGBeam(lx, ly, color) {
      const wallX = lx + (W / 2 - lx) * 0.3;
      const wallY = BACK_Y + 20;
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([5, 3]);
      ctx.globalAlpha = 0.4;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(wallX, wallY); ctx.stroke();
      ctx.globalAlpha = 1; ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(lx, ly); ctx.lineTo(wallX - 20, wallY); ctx.lineTo(wallX + 20, wallY);
      ctx.closePath();
      ctx.fillStyle = color; ctx.globalAlpha = 0.07; ctx.fill(); ctx.globalAlpha = 1;
    }

    function drawLabel(x, y, text, color) {
      ctx.font = '8px monospace'; ctx.textAlign = 'center';
      const w = ctx.measureText(text).width + 8;
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(x - w / 2, y - 8, w, 13);
      ctx.strokeStyle = color + '44'; ctx.lineWidth = 0.8;
      ctx.strokeRect(x - w / 2, y - 8, w, 13);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y + 2);
    }

    // === RENDER ===
    ctx.clearRect(0, 0, W, H);
    drawRoom();

    const subjScreenPos = {};
    subjectList.forEach(s => {
      const sp = drawSubject(s);
      subjScreenPos[s.id] = sp;
    });

    lights.forEach((light, i) => {
      const color = light.color || LIGHT_COLORS[i % LIGHT_COLORS.length];
      const angleDeg = getAngleDeg(light, i);
      const world = angleToWorld(angleDeg, 0.75);
      const lp = worldToScreen(world.side, world.depth, 0);
      const hp = worldToScreen(world.side, world.depth, 0.82);
      const bg = isBGLight(light);
      const target = !bg ? (subjScreenPos[light.target_subject_id] || subjScreenPos[1]) : null;

      if (bg) {
        drawBGBeam(hp.x, hp.y, color);
      } else if (target) {
        drawBeam(hp.x, hp.y, target.screenX, target.screenY, color);
      }

      drawStand(lp.x, lp.y, hp.x, hp.y);
      const scale = 0.55 + (1 - world.depth) * 0.45;
      drawLightIcon(hp.x, hp.y, getLightType(light), color, scale);
      drawLabel(hp.x, hp.y - 22 * scale, (light.name || '').split(' ').slice(0, 2).join(' '), color);

      ctx.font = '7px monospace'; ctx.textAlign = 'center';
      ctx.fillStyle = color + '88';
      ctx.fillText(`${angleDeg}°`, hp.x, hp.y + 22 * scale);
    });

    // Camera
    const camP = worldToScreen(0, -0.02, 0);
    ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.strokeRect(camP.x - 18, camP.y - 12, 36, 22);
    ctx.beginPath(); ctx.arc(camP.x, camP.y - 1, 7, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(camP.x, camP.y - 1, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6'; ctx.fill();
    ctx.strokeRect(camP.x + 10, camP.y - 10, 8, 6);
    ctx.font = 'bold 9px monospace'; ctx.fillStyle = '#3b82f6'; ctx.textAlign = 'center';
    ctx.fillText('CAM', camP.x, camP.y + 20);

  }, [lights, subjects, moodColor, subjectList]);

  const legendLights = lights.map((l, i) => ({
    name: l.name,
    color: l.color || LIGHT_COLORS[i % LIGHT_COLORS.length],
    isBG: isBGLight(l),
  }));

  return (
    <div style={{ background: "#060a12", borderRadius: 12, border: "1px solid #1e293b", padding: "8px", marginBottom: 16 }}>
      <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 4, textAlign: "center" }}>
        🎬 3D STUDIO — LIGHTING DIAGRAM
      </div>
      <canvas
        ref={canvasRef}
        width={320}
        height={380}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", marginTop: 8, padding: "0 4px" }}>
        {legendLights.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#0d1117", borderRadius: 4, padding: "3px 7px", border: `1px solid ${l.color}44` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "#94a3b8" }}>
              {l.name.split('/')[0].trim()}{l.isBG ? ' (ส่องฉาก)' : ''}
            </span>
          </div>
        ))}
        {subjectList.map((s, i) => (
          <div key={`s${i}`} style={{ display: "flex", alignItems: "center", gap: 4, background: "#0d1117", borderRadius: 4, padding: "3px 7px", border: "1px solid #33415544" }}>
            <div style={{ width: 8, height: 8, borderRadius: 0, background: "#475569", flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "#64748b" }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}