import React, { useEffect, useRef } from "react";

const SUBJ_POS = {
  "center":      { side: 0,     depth: 0.48 },
  "left":        { side: -0.5,  depth: 0.48 },
  "right":       { side: 0.5,   depth: 0.48 },
  "front":       { side: 0,     depth: 0.28 },
  "back":        { side: 0,     depth: 0.68 },
  "front-left":  { side: -0.38, depth: 0.32 },
  "front-right": { side: 0.38,  depth: 0.32 },
  "back-left":   { side: -0.38, depth: 0.62 },
  "back-right":  { side: 0.38,  depth: 0.62 },
};

const LIGHT_COLORS = ["#e8b84b","#5ba8e8","#e85b8a","#4be88a","#e8784b","#8b5be8","#4be8e8","#e84b4b"];

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

    const BACK_Y = H * 0.22, FLOOR_Y = H * 0.88;
    const BACK_L = W * 0.18, BACK_R = W * 0.82;
    const ROOM_L = W * 0.01, ROOM_R = W * 0.99;

    function wts(side, depth, height = 0) {
      const t = 0.2 + depth * 0.62;
      return {
        x: W / 2 + (side * W * 0.44) * (1 - t * 0.56),
        y: BACK_Y + (FLOOR_Y - BACK_Y) * (1 - depth) - height * H * 0.30 * (1 - depth * 0.18)
      };
    }

    function atw(deg, dist = 0.72) {
      const r = deg * Math.PI / 180;
      return { side: Math.sin(r) * dist * 1.3, depth: Math.max(0.05, Math.min(0.90, (1 - Math.cos(r)) * 0.5 * dist + 0.08)) };
    }

    function drawRoom(hasPhoto = false) {
      if (hasPhoto) return;

      // Floor
      const fg = ctx.createLinearGradient(W / 2, BACK_Y, W / 2, FLOOR_Y);
      fg.addColorStop(0, '#141c26'); fg.addColorStop(1, '#1a2332');
      ctx.beginPath();
      ctx.moveTo(ROOM_L, FLOOR_Y); ctx.lineTo(BACK_L, BACK_Y); ctx.lineTo(BACK_R, BACK_Y); ctx.lineTo(ROOM_R, FLOOR_Y);
      ctx.closePath(); ctx.fillStyle = fg; ctx.fill();

      for (let i = 1; i < 6; i++) {
        const t = i / 6, y = BACK_Y + (FLOOR_Y - BACK_Y) * t;
        const x1 = BACK_L + (ROOM_L - BACK_L) * t, x2 = BACK_R + (ROOM_R - BACK_R) * t;
        ctx.strokeStyle = `rgba(40,80,120,${0.10 + t * 0.15})`; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
      }
      for (let i = 1; i < 7; i++) {
        const t = i / 7, bx = BACK_L + (BACK_R - BACK_L) * t, fx = ROOM_L + (ROOM_R - ROOM_L) * t;
        ctx.strokeStyle = 'rgba(30,60,100,0.15)'; ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(bx, BACK_Y); ctx.lineTo(fx, FLOOR_Y); ctx.stroke();
      }

      // Back wall
      const wg = ctx.createLinearGradient(W / 2, H * 0.02, W / 2, BACK_Y);
      wg.addColorStop(0, '#111822'); wg.addColorStop(1, '#161f2e');
      ctx.beginPath();
      ctx.moveTo(BACK_L, BACK_Y); ctx.lineTo(BACK_R, BACK_Y); ctx.lineTo(BACK_R, H * 0.02); ctx.lineTo(BACK_L, H * 0.02);
      ctx.closePath(); ctx.fillStyle = wg; ctx.fill();

      for (let i = 1; i < 4; i++) {
        const x = BACK_L + (BACK_R - BACK_L) * i / 4;
        ctx.strokeStyle = 'rgba(30,60,100,0.12)'; ctx.lineWidth = 0.4;
        ctx.beginPath(); ctx.moveTo(x, H * 0.02); ctx.lineTo(x, BACK_Y); ctx.stroke();
      }

      // Side walls
      ctx.fillStyle = '#0e1520';
      ctx.beginPath(); ctx.moveTo(ROOM_L, FLOOR_Y); ctx.lineTo(BACK_L, BACK_Y); ctx.lineTo(BACK_L, H * 0.02); ctx.lineTo(ROOM_L, H * 0.04); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(ROOM_R, FLOOR_Y); ctx.lineTo(BACK_R, BACK_Y); ctx.lineTo(BACK_R, H * 0.02); ctx.lineTo(ROOM_R, H * 0.04); ctx.closePath(); ctx.fill();

      // Ceiling
      ctx.fillStyle = '#0c1118';
      ctx.beginPath(); ctx.moveTo(ROOM_L, H * 0.04); ctx.lineTo(BACK_L, H * 0.02); ctx.lineTo(BACK_R, H * 0.02); ctx.lineTo(ROOM_R, H * 0.04); ctx.closePath(); ctx.fill();

      // Room edges
      ctx.strokeStyle = 'rgba(50,100,160,0.5)'; ctx.lineWidth = 1.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(BACK_L, BACK_Y); ctx.lineTo(ROOM_L, FLOOR_Y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(BACK_R, BACK_Y); ctx.lineTo(ROOM_R, FLOOR_Y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ROOM_L, FLOOR_Y); ctx.lineTo(BACK_L, BACK_Y); ctx.lineTo(BACK_R, BACK_Y); ctx.lineTo(ROOM_R, FLOOR_Y); ctx.stroke();

      ctx.font = '8px -apple-system,sans-serif'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(40,80,130,0.6)'; ctx.fillText('↑ ด้านหลัง', W / 2, BACK_Y - 5);
    }

    function drawSubject(s) {
      const pos = SUBJ_POS[s.position] || SUBJ_POS.center;
      const p = wts(pos.side, pos.depth, 0);
      const sc = 0.55 + (1 - pos.depth) * 0.45;
      const sz = 22 * sc;

      const sg = ctx.createRadialGradient(p.x, p.y + 3, 0, p.x, p.y + 3, sz * 0.85);
      sg.addColorStop(0, 'rgba(0,0,0,0.6)'); sg.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.ellipse(p.x, p.y + 3, sz * 0.85, sz * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = sg; ctx.fill();

      ctx.strokeStyle = '#4a6a7a'; ctx.lineWidth = 2 * sc; ctx.lineCap = 'round'; ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(p.x, p.y - sz * 0.9, sz * 0.34, 0, Math.PI * 2);
      ctx.fillStyle = '#1a2a38'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x, p.y - sz * 0.55); ctx.lineTo(p.x, p.y + sz * 0.2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x - sz * 0.4, p.y - sz * 0.28); ctx.lineTo(p.x + sz * 0.4, p.y - sz * 0.28); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x - sz * 0.4, p.y - sz * 0.28); ctx.lineTo(p.x - sz * 0.45, p.y + sz * 0.1);
      ctx.moveTo(p.x + sz * 0.4, p.y - sz * 0.28); ctx.lineTo(p.x + sz * 0.45, p.y + sz * 0.1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + sz * 0.2); ctx.lineTo(p.x - sz * 0.2, p.y + sz * 0.7);
      ctx.moveTo(p.x, p.y + sz * 0.2); ctx.lineTo(p.x + sz * 0.2, p.y + sz * 0.7);
      ctx.stroke();

      ctx.font = `bold ${8 * sc}px -apple-system,sans-serif`; ctx.textAlign = 'center';
      const lw = ctx.measureText(s.label).width + 10, lx = p.x - lw / 2, ly = p.y + sz * 0.75;
      ctx.fillStyle = 'rgba(10,16,24,0.9)'; ctx.fillRect(lx, ly, lw, 13 * sc);
      ctx.strokeStyle = 'rgba(60,100,140,0.5)'; ctx.lineWidth = 0.8; ctx.strokeRect(lx, ly, lw, 13 * sc);
      ctx.fillStyle = '#7a9ab0'; ctx.fillText(s.label, p.x, ly + 9 * sc);
      return { screenX: p.x, screenY: p.y - sz * 0.9 };
    }

    function drawLightBeam(lx, ly, tx, ty, color, type) {
      const dx = tx - lx, dy = ty - ly, d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1) return;
      const nx = dx / d, ny = dy / d, px = -ny, py = nx;
      const spread = type === 'hmi' ? 0.10 : type === 'panel' ? 0.16 : 0.13;
      for (let i = 5; i >= 0; i--) {
        const alpha = (i / 5) * 0.15, w = spread * d * (i / 5) * 0.45 + 1.5;
        ctx.beginPath();
        ctx.moveTo(lx, ly); ctx.lineTo(tx + px * w, ty + py * w); ctx.lineTo(tx - px * w, ty - py * w);
        ctx.closePath();
        const cg = ctx.createLinearGradient(lx, ly, tx, ty);
        cg.addColorStop(0, color + '00');
        cg.addColorStop(0.4, color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        cg.addColorStop(1, color + '05');
        ctx.fillStyle = cg; ctx.fill();
      }
      ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.setLineDash([]);
      ctx.globalAlpha = 0.7;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.globalAlpha = 1;
      const edgeW = spread * d * 0.35;
      ctx.strokeStyle = color; ctx.lineWidth = 0.5; ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(tx + px * edgeW, ty + py * edgeW); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(tx - px * edgeW, ty - py * edgeW); ctx.stroke();
      ctx.globalAlpha = 1;
      const hg = ctx.createRadialGradient(tx, ty, 0, tx, ty, 22);
      hg.addColorStop(0, color + '40'); hg.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(tx, ty, 22, 0, Math.PI * 2); ctx.fillStyle = hg; ctx.fill();
    }

    function drawBGBeam(lx, ly, color) {
      const wx = lx + (W / 2 - lx) * 0.3, wy = BACK_Y + 16;
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.setLineDash([5, 3]);
      ctx.globalAlpha = 0.35;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(wx, wy); ctx.stroke();
      ctx.globalAlpha = 1; ctx.setLineDash([]);
    }

    function drawLightIcon(x, y, type, color, sc) {
      const s = 11 * sc;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, s * 2.2);
      glow.addColorStop(0, color + '25'); glow.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(x, y, s * 2.2, 0, Math.PI * 2); ctx.fillStyle = glow; ctx.fill();

      ctx.strokeStyle = color; ctx.lineWidth = 1.5 * sc; ctx.setLineDash([]);

      if (type === 'panel') {
        ctx.fillStyle = '#1a2535'; ctx.fillRect(x - s, y - s * 0.6, s * 2, s * 1.2);
        ctx.strokeRect(x - s, y - s * 0.6, s * 2, s * 1.2);
        [[-0.5, -0.25], [0, -0.25], [0.5, -0.25], [-0.5, 0.12], [0, 0.12], [0.5, 0.12], [-0.5, 0.4], [0, 0.4], [0.5, 0.4]].forEach(([dx, dy]) => {
          ctx.beginPath(); ctx.arc(x + dx * s * 1.3, y + dy * s * 1.25, 1.3 * sc, 0, Math.PI * 2);
          ctx.fillStyle = color; ctx.fill();
        });
      } else if (type === 'hmi') {
        ctx.fillStyle = '#1a2535'; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
        [s, s * 0.7, s * 0.42, s * 0.18].forEach(r => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); });
        ctx.beginPath(); ctx.arc(x, y, 2 * sc, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
        ctx.lineWidth = 1 * sc; ctx.strokeStyle = color + '66'; ctx.strokeRect(x - s, y - s, s * 2, s * 2);
      } else {
        ctx.fillStyle = '#1a2535'; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = color; ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, s * 0.6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 2.2 * sc, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
        ctx.lineWidth = 1 * sc; ctx.strokeStyle = color + '55'; ctx.strokeRect(x - s, y - s, s * 2, s * 2);
      }
    }

    function drawStand(bx, floorY, hx, hy) {
      const sg = ctx.createRadialGradient(bx, floorY + 4, 0, bx, floorY + 4, 10);
      sg.addColorStop(0, 'rgba(0,0,0,0.5)'); sg.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.ellipse(bx, floorY + 4, 10, 3.5, 0, 0, Math.PI * 2); ctx.fillStyle = sg; ctx.fill();

      ctx.strokeStyle = '#2a3d50'; ctx.lineWidth = 2.5; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(bx, floorY); ctx.lineTo(hx, hy + 10); ctx.stroke();
      ctx.strokeStyle = '#1e2e40'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - 12, floorY + 7); ctx.lineTo(bx, floorY);
      ctx.moveTo(bx + 12, floorY + 7); ctx.lineTo(bx, floorY);
      ctx.moveTo(bx, floorY + 8); ctx.lineTo(bx, floorY);
      ctx.stroke();
      ctx.fillStyle = '#253545';
      ctx.fillRect(hx - 4, hy + 4, 8, 5);
      ctx.beginPath(); ctx.ellipse(bx, floorY + 4, 10, 3.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#3a5060'; ctx.lineWidth = 1; ctx.stroke();
    }

    function drawLabel(x, y, name, color, deg, sc) {
      const short = name.length > 11 ? name.substring(0, 11) + '…' : name;
      ctx.font = `bold ${8.5 * sc}px -apple-system,sans-serif`;
      const tw = ctx.measureText(short).width + 10;
      const s = 11 * sc;
      const offX = deg < 0 ? -(tw + s + 6) : s + 6;
      const lx = x + offX, ly = y - s - 16 * sc;

      ctx.strokeStyle = color + '44'; ctx.lineWidth = 0.7; ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(x + (deg < 0 ? -s : s), y); ctx.lineTo(lx + tw / 2, ly + 6 * sc); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(10,16,24,0.92)'; ctx.fillRect(lx - 1, ly - 1, tw + 2, 13 * sc + 2);
      ctx.strokeStyle = color + '66'; ctx.lineWidth = 1; ctx.strokeRect(lx, ly, tw, 13 * sc);
      ctx.fillStyle = color; ctx.textAlign = 'left'; ctx.fillText(short, lx + 5, ly + 9 * sc);
      ctx.font = `${7 * sc}px monospace`; ctx.textAlign = 'center';
      ctx.fillStyle = color + '88'; ctx.fillText(`${deg}°`, x, y + s + 12 * sc);
    }

    function drawCamera() {
      const cp = wts(0, -0.02, 0);
      const cshadow = ctx.createRadialGradient(cp.x, cp.y + 24, 0, cp.x, cp.y + 24, 16);
      cshadow.addColorStop(0, 'rgba(0,0,0,0.4)'); cshadow.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.ellipse(cp.x, cp.y + 24, 16, 5, 0, 0, Math.PI * 2); ctx.fillStyle = cshadow; ctx.fill();

      ctx.strokeStyle = '#243040'; ctx.lineWidth = 2.2; ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(cp.x - 9, cp.y + 10); ctx.lineTo(cp.x - 14, cp.y + 24);
      ctx.moveTo(cp.x + 9, cp.y + 10); ctx.lineTo(cp.x + 14, cp.y + 24);
      ctx.moveTo(cp.x, cp.y + 10); ctx.lineTo(cp.x, cp.y + 26);
      ctx.stroke();

      ctx.fillStyle = '#0e1828'; ctx.fillRect(cp.x - 16, cp.y - 10, 32, 20);
      ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2; ctx.strokeRect(cp.x - 16, cp.y - 10, 32, 20);
      ctx.fillStyle = '#0c1e38'; ctx.beginPath(); ctx.arc(cp.x, cp.y, 7, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3b82f6'; ctx.stroke();
      ctx.beginPath(); ctx.arc(cp.x, cp.y, 3, 0, Math.PI * 2); ctx.fillStyle = '#60a5fa'; ctx.fill();
      ctx.strokeStyle = '#2563eb'; ctx.strokeRect(cp.x + 9, cp.y - 8, 7, 5);
      ctx.font = 'bold 8px -apple-system,sans-serif'; ctx.fillStyle = '#3b82f6'; ctx.textAlign = 'center';
      ctx.fillText('CAM', cp.x, cp.y + 36);
    }

    function renderAll(hasPhoto = false) {
      drawRoom(hasPhoto);
      const sp = {};
      subjectList.forEach(s => { sp[s.id] = drawSubject(s); });

      lights.forEach((light, i) => {
        const color = light.color || LIGHT_COLORS[i % LIGHT_COLORS.length];
        const angleDeg = getAngleDeg(light, i);
        const world = atw(angleDeg, 0.72);
        const hp = wts(world.side, world.depth, 0.76);
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
        const hp = wts(world.side, world.depth, 0.76);
        const floorY = BACK_Y + (FLOOR_Y - BACK_Y) * (1 - world.depth);
        drawStand(lp.x, floorY, hp.x, hp.y);
        const sc = 0.62 + (1 - world.depth) * 0.38;
        drawLightIcon(hp.x, hp.y, getLightType(light), color, sc);
        drawLabel(hp.x, hp.y, light.name || '', color, angleDeg, sc);
      });

      drawCamera();
    }

    // RENDER
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0f1318'; ctx.fillRect(0, 0, W, H);

    // Vignette
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
    vg.addColorStop(0, 'transparent'); vg.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

    if (imageBase64) {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const canvasRatio = W / H;
        let drawW, drawH, ox, oy;
        if (ratio > canvasRatio) {
          drawH = H; drawW = drawH * ratio; ox = (W - drawW) / 2; oy = 0;
        } else {
          drawW = W; drawH = drawW / ratio; ox = 0; oy = (H - drawH) / 2;
        }
        ctx.globalAlpha = 0.45;
        ctx.drawImage(img, ox, oy, drawW, drawH);
        ctx.globalAlpha = 1;
        // Dark overlay
        ctx.fillStyle = 'rgba(10,16,24,0.45)';
        ctx.fillRect(0, 0, W, H);
        renderAll(true);
      };
      img.src = `data:image/jpeg;base64,${imageBase64}`;
    } else {
      renderAll(false);
    }

    // Title bar
    ctx.fillStyle = 'rgba(10,14,20,0.8)';
    ctx.fillRect(0, 0, W, 24);
    ctx.font = 'bold 9px -apple-system,sans-serif'; ctx.fillStyle = '#3a6a9a'; ctx.textAlign = 'left';
    ctx.fillText('3D LIGHTING DIAGRAM', 10, 16);
    ctx.font = '8px monospace'; ctx.fillStyle = '#1e3a5a'; ctx.textAlign = 'right';
    ctx.fillText('TOP VIEW', W - 10, 16);

  }, [lights, subjects, imageBase64, subjectList]);

  const legendLights = lights.map((l, i) => ({
    name: l.name, color: l.color || LIGHT_COLORS[i % LIGHT_COLORS.length], isBG: isBGLight(l),
  }));

  return (
    <div style={{ background: "#0f1318", borderRadius: 12, border: "1px solid #1e2d3d", padding: "8px", marginBottom: 16 }}>
      <canvas ref={canvasRef} width={320} height={380} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", marginTop: 8, padding: "0 4px" }}>
        {legendLights.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#0d1520", borderRadius: 4, padding: "3px 8px", border: `1px solid ${l.color}33` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "#7a9ab0", fontFamily: "-apple-system,sans-serif" }}>
              {(l.name || '').split('/')[0].trim()}{l.isBG ? ' (ส่องฉาก)' : ''}
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