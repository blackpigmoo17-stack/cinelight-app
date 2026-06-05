import React from "react";

// angle: 0 = ตรงหน้า (ใกล้กล้อง), 180 = ด้านหลัง, 90 = ขวา, -90 = ซ้าย
const LIGHT_POSITIONS = {
  "Key Light":                      { angle: -40,  dist: 0.6,  label: "KEY" },
  "Key Light (Warm)":               { angle: -40,  dist: 0.6,  label: "KEY" },
  "Key Light (Cool)":               { angle: -40,  dist: 0.6,  label: "KEY" },
  "Hard Key Light":                 { angle: -90,  dist: 0.65, label: "KEY" },
  "Soft Key Light":                 { angle: -35,  dist: 0.58, label: "KEY" },
  "Beauty Dish / Large Softbox":    { angle: 0,    dist: 0.55, label: "BEAUTY" },
  "Fill Light":                     { angle: 40,   dist: 0.6,  label: "FILL" },
  "Rim / Hair Light":               { angle: 180,  dist: 0.65, label: "RIM" },
  "Rim Light":                      { angle: -150, dist: 0.65, label: "RIM" },
  "Rim / Kicker":                   { angle: 150,  dist: 0.65, label: "KICK" },
  "Hair Light":                     { angle: 180,  dist: 0.6,  label: "HAIR" },
  "Background Light":               { angle: 180,  dist: 0.88, label: "BG" },
  "Practical Light":                { angle: 110,  dist: 0.5,  label: "PRAC" },
  "Practical Red/Green":            { angle: -110, dist: 0.5,  label: "PRAC" },
  "Practical Candle/Fairy lights":  { angle: 90,   dist: 0.45, label: "PRAC" },
  "Under Light (Monster Light)":    { angle: 0,    dist: 0.35, label: "UNDER" },
  "Neon Accent (Cyan)":             { angle: -90,  dist: 0.7,  label: "CYAN" },
  "Neon Accent (Purple)":           { angle: 90,   dist: 0.7,  label: "PURP" },
  "Moving Head / Spot":             { angle: -60,  dist: 0.75, label: "MOVE" },
  "LED RGB Wall":                   { angle: 180,  dist: 0.9,  label: "WALL" },
  "Haze Machine":                   { angle: 60,   dist: 0.4,  label: "HAZE" },
  "Natural Key Light":              { angle: -45,  dist: 0.7,  label: "NAT" },
};

const LIGHT_COLORS = [
  "#fbbf24","#60a5fa","#f472b6","#34d399","#f97316","#a78bfa","#06b6d4","#ef4444","#e2e8f0","#84cc16"
];
const AI_NAME_MAP = {
  "key": { angle: -40, dist: 0.6, label: "KEY" },
  "fill": { angle: 40, dist: 0.6, label: "FILL" },
  "rim": { angle: -150, dist: 0.65, label: "RIM" },
  "hair": { angle: 180, dist: 0.6, label: "HAIR" },
  "background": { angle: 180, dist: 0.88, label: "BG" },
  "back": { angle: 180, dist: 0.88, label: "BG" },
  "kicker": { angle: 150, dist: 0.65, label: "KICK" },
  "practical": { angle: 110, dist: 0.5, label: "PRAC" },
  "ไฟหลัก": { angle: -40, dist: 0.6, label: "KEY" },
  "ไฟเติม": { angle: 40, dist: 0.6, label: "FILL" },
  "ไฟขอบ": { angle: -150, dist: 0.65, label: "RIM" },
  "ไฟผม": { angle: 180, dist: 0.6, label: "HAIR" },
  "ไฟหลัง": { angle: 180, dist: 0.88, label: "BG" },
  "ไฟฉาก": { angle: 180, dist: 0.88, label: "BG" },
  "ไฟคิก": { angle: 150, dist: 0.65, label: "KICK" },
  "แสงธรรมชาติ": { angle: -45, dist: 0.7, label: "NAT" },
};
const DEFAULT_ANGLES = [-40, 40, -150, 150, -90, 90, 170, 10];

export default function LightingDiagram3D({ lights, moodColor }) {
  const W = 340, H = 370;
  const cx = W / 2;
  const subjectY = H * 0.40;
  const cameraY = H - 25;
  const r = 125;

  const lightData = lights.map((light, i) => {
  const nameLower = light.name.toLowerCase();

  // 1. หาจาก LIGHT_POSITIONS เดิมก่อน
  const found = Object.entries(LIGHT_POSITIONS).find(([key]) =>
    nameLower.includes(key.toLowerCase().split(" ")[0]) ||
    key.toLowerCase().includes(nameLower.split(" ")[0])
  );

  // 2. ถ้าไม่เจอ ลอง AI_NAME_MAP
  const aiFound = !found && Object.entries(AI_NAME_MAP).find(([key]) =>
    light.name.includes(key) || nameLower.includes(key.toLowerCase())
  );

  const pos = found
    ? found[1]
    : aiFound
    ? aiFound[1]
    : { angle: DEFAULT_ANGLES[i % DEFAULT_ANGLES.length], dist: 0.65, label: `L${i + 1}` };

  const rad = pos.angle * Math.PI / 180;
  const lx = cx + Math.sin(rad) * r * pos.dist;
  const ly = subjectY + Math.cos(rad) * r * pos.dist * 0.85;

  return { ...light, lx, ly, label: pos.label, color: LIGHT_COLORS[i % LIGHT_COLORS.length] };
});

  return (
    <div style={{ background: "#060a12", borderRadius: 12, border: "1px solid #1e293b", padding: "12px 8px", marginBottom: 16 }}>
      <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 4, textAlign: "center" }}>
        🎬 TOP VIEW — LIGHTING DIAGRAM
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>

        {/* Room */}
        <rect x="10" y="10" width={W-20} height={H-20} rx="10" fill="#0a0f1a" stroke="#1e293b" strokeWidth="1" />

        {/* Grid */}
        {[1,2,3,4,5].map(i => (
          <g key={i}>
            <line x1={10+i*(W-20)/6} y1="10" x2={10+i*(W-20)/6} y2={H-10} stroke="#0f2040" strokeWidth="0.5" />
            <line x1="10" y1={10+i*(H-20)/6} x2={W-10} y2={10+i*(H-20)/6} stroke="#0f2040" strokeWidth="0.5" />
          </g>
        ))}

        {/* Labels */}
        <text x={cx} y="22" textAnchor="middle" fontSize="7" fill="#1e3a5f">↑ ด้านหลัง</text>
        <text x={cx} y={H-8} textAnchor="middle" fontSize="7" fill="#3b82f6">📷 กล้อง / ด้านหน้า</text>

        {/* Distance rings */}
        <ellipse cx={cx} cy={subjectY} rx={r*0.82} ry={r*0.7} fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />
        <ellipse cx={cx} cy={subjectY} rx={r*0.48} ry={r*0.4} fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="3 3" />

        {/* Camera FOV */}
        <polygon points={`${cx},${cameraY-18} ${cx-30},${subjectY+28} ${cx+30},${subjectY+28}`}
          fill="#3b82f6" opacity="0.06" />
        <line x1={cx} y1={cameraY-18} x2={cx} y2={subjectY+20}
          stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.25" strokeDasharray="6 4" />

        {/* Light beams */}
        {lightData.map((l, i) => {
          const dx = cx - l.lx, dy = subjectY - l.ly;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d === 0) return null;
          const nx = dx/d, ny = dy/d;
          const px = -ny, py = nx;
          const spread = 28;
          return (
            <polygon key={i}
              points={`${l.lx},${l.ly} ${cx+px*spread-nx*10},${subjectY+py*spread-ny*10} ${cx-px*spread-nx*10},${subjectY-py*spread-ny*10}`}
              fill={l.color} opacity="0.1" />
          );
        })}

        {/* Dashed lines to subject */}
        {lightData.map((l, i) => (
          <line key={i} x1={l.lx} y1={l.ly} x2={cx} y2={subjectY}
            stroke={l.color} strokeWidth="1" strokeOpacity="0.35" strokeDasharray="5 3" />
        ))}

        {/* Subject */}
        <ellipse cx={cx} cy={subjectY+10} rx="12" ry="7" fill="#000" opacity="0.4" />
        <ellipse cx={cx} cy={subjectY+7} rx="9" ry="6" fill="#1e293b" stroke="#334155" strokeWidth="1" />
        <circle cx={cx} cy={subjectY-8} r="13" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
        <circle cx={cx} cy={subjectY-1} r="3" fill="#475569" />
        {lightData[0] && <circle cx={cx} cy={subjectY-8} r="13" fill={lightData[0].color} opacity="0.12" />}
        <text x={cx} y={subjectY+26} textAnchor="middle" fontSize="7" fill="#64748b" fontWeight="bold">SUBJECT</text>

        {/* Light fixtures */}
        {lightData.map((l, i) => (
          <g key={i}>
            <circle cx={l.lx} cy={l.ly} r="20" fill={l.color} opacity="0.07" />
            <circle cx={l.lx} cy={l.ly} r="14" fill="#0d1117" stroke={l.color} strokeWidth="1.5" />
            <circle cx={l.lx} cy={l.ly} r="8" fill={l.color} opacity="0.35" />
            <circle cx={l.lx} cy={l.ly} r="4" fill={l.color} opacity="0.8" />
            <text x={l.lx} y={l.ly+3} textAnchor="middle" fontSize="6" fontWeight="bold" fill="#0a0f1a">#{i+1}</text>
            <text x={l.lx} y={l.ly-18} textAnchor="middle" fontSize="7.5" fontWeight="bold" fill={l.color}>{l.label}</text>
            <text x={l.lx} y={l.ly+25} textAnchor="middle" fontSize="6" fill="#475569">{l.temp}</text>
          </g>
        ))}

        {/* Camera */}
        <rect x={cx-14} y={cameraY-16} width="28" height="18" rx="4"
          fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
        <circle cx={cx} cy={cameraY-8} r="5" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
        <circle cx={cx} cy={cameraY-8} r="2.5" fill="#3b82f6" opacity="0.8" />
        <rect x={cx+8} y={cameraY-15} width="5" height="4" rx="1" fill="#3b82f6" opacity="0.5" />
        <text x={cx} y={cameraY+8} textAnchor="middle" fontSize="8" fill="#3b82f6" fontWeight="bold">YOU</text>

      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", marginTop: 8, padding: "0 8px" }}>
        {lightData.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#0d1117", borderRadius: 4, padding: "3px 8px", border: `1px solid ${l.color}44` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "#94a3b8" }}>#{i+1} {l.name.split("/")[0].trim()}</span>
            <span style={{ fontSize: 9, color: l.color }}>{l.power}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
