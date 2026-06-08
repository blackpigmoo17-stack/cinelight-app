import React from "react";

const LIGHT_COLORS = [
  "#fbbf24","#60a5fa","#f472b6","#34d399","#f97316","#a78bfa","#06b6d4","#ef4444"
];

const AI_NAME_MAP = {
  "key": { angle: -40, dist: 0.55, label: "KEY" },
  "fill": { angle: 40, dist: 0.55, label: "FILL" },
  "rim": { angle: -150, dist: 0.65, label: "RIM" },
  "hair": { angle: 175, dist: 0.6, label: "HAIR" },
  "background": { angle: 175, dist: 0.85, label: "BG" },
  "back": { angle: 175, dist: 0.85, label: "BG" },
  "kicker": { angle: 150, dist: 0.65, label: "KICK" },
  "practical": { angle: 110, dist: 0.5, label: "PRAC" },
  "ไฟหลัก": { angle: -40, dist: 0.55, label: "KEY" },
  "ไฟเติม": { angle: 40, dist: 0.55, label: "FILL" },
  "ไฟขอบ": { angle: -150, dist: 0.65, label: "RIM" },
  "ไฟผม": { angle: 175, dist: 0.6, label: "HAIR" },
  "ไฟหลัง": { angle: 175, dist: 0.85, label: "BG" },
  "ไฟฉาก": { angle: 175, dist: 0.85, label: "BG" },
  "ไฟคิก": { angle: 150, dist: 0.65, label: "KICK" },
  "แสงธรรมชาติ": { angle: -45, dist: 0.7, label: "NAT" },
};

const LIGHT_POSITIONS = {
  "Key Light":                     { angle: -40,  dist: 0.55, label: "KEY" },
  "Key Light (Warm)":              { angle: -40,  dist: 0.55, label: "KEY" },
  "Key Light (Cool)":              { angle: -40,  dist: 0.55, label: "KEY" },
  "Hard Key Light":                { angle: -90,  dist: 0.6,  label: "KEY" },
  "Soft Key Light":                { angle: -35,  dist: 0.5,  label: "KEY" },
  "Beauty Dish / Large Softbox":   { angle: 0,    dist: 0.5,  label: "BEAUTY" },
  "Fill Light":                    { angle: 40,   dist: 0.55, label: "FILL" },
  "Rim / Hair Light":              { angle: 175,  dist: 0.65, label: "RIM" },
  "Rim Light":                     { angle: -150, dist: 0.65, label: "RIM" },
  "Rim / Kicker":                  { angle: 150,  dist: 0.65, label: "KICK" },
  "Hair Light":                    { angle: 175,  dist: 0.6,  label: "HAIR" },
  "Background Light":              { angle: 175,  dist: 0.85, label: "BG" },
  "Practical Light":               { angle: 110,  dist: 0.5,  label: "PRAC" },
  "Natural Key Light":             { angle: -45,  dist: 0.7,  label: "NAT" },
};

const DEFAULT_ANGLES = [-40, 40, -150, 150, -90, 90, 170, 10];

const SUBJECT_POSITIONS = {
  "center":       { ox: 0,   oy: 0 },
  "left":         { ox: -45, oy: 5 },
  "right":        { ox: 45,  oy: -5 },
  "front":        { ox: 0,   oy: 30 },
  "back":         { ox: 0,   oy: -25 },
  "front-left":   { ox: -35, oy: 25 },
  "front-right":  { ox: 35,  oy: 20 },
  "back-left":    { ox: -35, oy: -20 },
  "back-right":   { ox: 35,  oy: -25 },
};

// แปลง world coords → isometric screen coords
function toIso(x, y) {
  return {
    sx: (x - y) * 0.866,
    sy: (x + y) * 0.5,
  };
}

export default function LightingDiagram3D({ lights = [], moodColor, subjects = [] }) {
  const W = 340;
  const H = 400;

  // origin ของ isometric grid (กลางจอ)
  const ox = W / 2;
  const oy = H * 0.42;
  const scale = 90;

  const subjectList = subjects.length > 0
    ? subjects
    : [{ id: 1, label: "Subject", position: "center" }];

  // คำนวณตำแหน่ง subject ใน world space แล้วแปลง iso
  const subjectData = subjectList.map((s, i) => {
    const pos = SUBJECT_POSITIONS[s.position] || SUBJECT_POSITIONS["center"];
    const wx = pos.ox / 80;
    const wy = pos.oy / 80;
    const iso = toIso(wx * scale, wy * scale);
    return { ...s, sx: ox + iso.sx, sy: oy + iso.sy };
  });

  // คำนวณตำแหน่งไฟ
  const lightData = lights.map((light, i) => {
  // ใช้ angle_deg จาก AI โดยตรง ถ้าไม่มีค่อย fallback ไป name matching
  let angleDeg, label;

  if (typeof light.angle_deg === "number") {
    angleDeg = light.angle_deg;
    // กำหนด label จากชื่อไฟ
    const nameLower = light.name.toLowerCase();
    const aiFound = Object.entries(AI_NAME_MAP).find(([key]) =>
      light.name.includes(key) || nameLower.includes(key.toLowerCase())
    );
    label = aiFound ? aiFound[1].label : `L${i + 1}`;
  } else {
    // fallback: match จากชื่อ
    const nameLower = light.name.toLowerCase();
    const found = Object.entries(LIGHT_POSITIONS).find(([key]) =>
      nameLower.includes(key.toLowerCase().split(" ")[0]) ||
      key.toLowerCase().includes(nameLower.split(" ")[0])
    );
    const aiFound = !found && Object.entries(AI_NAME_MAP).find(([key]) =>
      light.name.includes(key) || nameLower.includes(key.toLowerCase())
    );
    const posData = found ? found[1] : aiFound ? aiFound[1]
      : { angle: DEFAULT_ANGLES[i % DEFAULT_ANGLES.length], label: `L${i + 1}` };
    angleDeg = posData.angle;
    label = posData.label;
  }

  const dist = 0.6;
  const rad = angleDeg * Math.PI / 180;
const wx = Math.sin(rad) * dist * scale;
const wy = -Math.cos(rad) * dist * scale;
  const iso = toIso(wx, wy);
  const lx = ox + iso.sx;
  const ly = oy + iso.sy - 70;

  const color = LIGHT_COLORS[i % LIGHT_COLORS.length];
  const targetId = light.target_subject_id || 1;
  const target = subjectData.find(s => s.id === targetId) || subjectData[0];

  const baseIso = toIso(wx, wy);
  const bx = ox + baseIso.sx;
  const by = oy + baseIso.sy;

  return { ...light, lx, ly, bx, by, label, color, target };
});

  // วาด isometric floor tiles
  const tileSize = 30;
  const tiles = [];
  for (let gx = -3; gx <= 3; gx++) {
    for (let gy = -3; gy <= 3; gy++) {
      const iso = toIso(gx * tileSize, gy * tileSize);
      const cx2 = ox + iso.sx;
      const cy2 = oy + iso.sy;
      const half = tileSize;
      const pts = [
        `${cx2},${cy2 - half * 0.5}`,
        `${cx2 + half},${cy2}`,
        `${cx2},${cy2 + half * 0.5}`,
        `${cx2 - half},${cy2}`,
      ].join(" ");
      const shade = (gx + gy) % 2 === 0 ? "#090d18" : "#0a0f1a";
      tiles.push(<polygon key={`${gx},${gy}`} points={pts} fill={shade} stroke="#1e3a5f" strokeWidth="0.4" />);
    }
  }

  const drawSubject = (s) => (
    <g key={s.id}>
      <ellipse cx={s.sx} cy={s.sy + 8} rx="12" ry="5" fill="#000" opacity="0.45" />
      {/* Isometric body box */}
      <polygon
        points={`${s.sx},${s.sy - 8} ${s.sx + 10},${s.sy - 3} ${s.sx + 10},${s.sy + 8} ${s.sx},${s.sy + 3}`}
        fill="#1a2535" stroke="#334155" strokeWidth="0.5"
      />
      <polygon
        points={`${s.sx},${s.sy - 8} ${s.sx - 10},${s.sy - 3} ${s.sx - 10},${s.sy + 8} ${s.sx},${s.sy + 3}`}
        fill="#162030" stroke="#334155" strokeWidth="0.5"
      />
      <polygon
        points={`${s.sx - 10},${s.sy - 3} ${s.sx},${s.sy - 8} ${s.sx + 10},${s.sy - 3} ${s.sx},${s.sy + 2}`}
        fill="#1e293b" stroke="#475569" strokeWidth="0.5"
      />
      {/* Head */}
      <circle cx={s.sx} cy={s.sy - 18} r="11" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
      <circle cx={s.sx} cy={s.sy - 18} r="6" fill="#0f172a" stroke="#334155" strokeWidth="1" />
      {/* Label */}
      <rect x={s.sx - 36} y={s.sy + 12} width="72" height="18" rx="3" fill="#0d1117" stroke="#33415533" strokeWidth="1" />
      <text x={s.sx} y={s.sy + 25} textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="monospace">{s.label || `S${s.id}`}</text>
    </g>
  );

  return (
    <div style={{ background: "#060a12", borderRadius: 12, border: "1px solid #1e293b", padding: "10px 8px", marginBottom: 16 }}>
      <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2, marginBottom: 4, textAlign: "center" }}>
        🎬 ISOMETRIC — LIGHTING DIAGRAM
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>

        {/* Floor tiles */}
        {tiles}

        {/* Light beams */}
        {lightData.map((l, i) => {
          const tx = l.target ? l.target.sx : ox;
          const ty = l.target ? l.target.sy - 18 : oy;
          const dx = tx - l.lx, dy = ty - l.ly;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d === 0) return null;
          const nx = dx / d, ny = dy / d;
          const px = -ny, py = nx;
          const spread = 18;
          return (
            <polygon key={i}
              points={`${l.lx},${l.ly} ${tx + px * spread},${ty + py * spread} ${tx - px * spread},${ty - py * spread}`}
              fill={l.color} opacity="0.09"
            />
          );
        })}

        {/* Stand poles */}
        {lightData.map((l, i) => (
          <line key={i}
            x1={l.bx} y1={l.by}
            x2={l.lx} y2={l.ly + 8}
            stroke="#334155" strokeWidth="2" strokeLinecap="round"
          />
        ))}

        {/* Stand bases */}
        {lightData.map((l, i) => (
          <g key={i}>
            <ellipse cx={l.bx} cy={l.by} rx="9" ry="4" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
            <line x1={l.bx - 8} y1={l.by + 2} x2={l.bx - 14} y2={l.by + 6} stroke="#334155" strokeWidth="1.2" />
            <line x1={l.bx + 8} y1={l.by + 2} x2={l.bx + 14} y2={l.by + 6} stroke="#334155" strokeWidth="1.2" />
          </g>
        ))}

        {/* Dashed beam lines */}
        {lightData.map((l, i) => {
          const tx = l.target ? l.target.sx : ox;
          const ty = l.target ? l.target.sy - 18 : oy;
          return (
            <line key={i}
              x1={l.lx} y1={l.ly + 8}
              x2={tx} y2={ty}
              stroke={l.color} strokeWidth="1" strokeOpacity="0.45" strokeDasharray="5 3"
            />
          );
        })}

        {/* Subjects */}
        {subjectData.map(s => drawSubject(s))}

        {/* Light fixtures */}
        {lightData.map((l, i) => (
          <g key={i}>
            <circle cx={l.lx} cy={l.ly} r="16" fill={l.color} opacity="0.07" />
            <rect x={l.lx - 11} y={l.ly - 7} width="22" height="14" rx="3"
              fill="#0d1117" stroke={l.color} strokeWidth="1.5" />
            <rect x={l.lx - 7} y={l.ly - 4} width="14" height="8" rx="2"
              fill={l.color} opacity="0.55" />
            <text x={l.lx} y={l.ly - 12} textAnchor="middle" fontSize="7.5"
              fontWeight="bold" fill={l.color} fontFamily="monospace">{l.label}</text>
            <text x={l.lx} y={l.ly + 18} textAnchor="middle" fontSize="6.5"
              fill="#475569" fontFamily="monospace">#{i + 1}</text>
          </g>
        ))}

        {/* Camera */}
        <ellipse cx={ox} cy={oy + 95} rx="12" ry="5" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
        <line x1={ox - 8} y1={oy + 95} x2={ox - 14} y2={oy + 108} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox + 8} y1={oy + 95} x2={ox + 14} y2={oy + 108} stroke="#334155" strokeWidth="1.5" />
        <line x1={ox} y1={oy + 95} x2={ox} y2={oy + 110} stroke="#334155" strokeWidth="1.5" />
        <rect x={ox - 14} y={oy + 72} width="28" height="18" rx="4"
          fill="#0f172a" stroke="#3b82f6" strokeWidth="2" />
        <circle cx={ox} cy={oy + 81} r="5" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="1.5" />
        <circle cx={ox} cy={oy + 81} r="2.5" fill="#3b82f6" opacity="0.8" />
        <text x={ox} y={oy + 118} textAnchor="middle" fontSize="8"
          fill="#3b82f6" fontWeight="bold" fontFamily="monospace">CAM</text>

      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center", marginTop: 8, padding: "0 8px" }}>
        {lightData.map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#0d1117", borderRadius: 4, padding: "3px 8px", border: `1px solid ${l.color}44` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.color, flexShrink: 0 }} />
            <span style={{ fontSize: 9, color: "#94a3b8" }}>#{i + 1} {l.name.split("/")[0].trim()}</span>
            {l.target && subjectList.length > 1 && (
              <span style={{ fontSize: 9, color: "#475569" }}>→ {l.target.label}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}