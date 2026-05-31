import { useState } from "react";

const EQUIPMENT_TYPES = [
  {
    id: "led_cob",
    name: "LED COB",
    emoji: "💡",
    examples: "เช่น Aputure 600d, Amaran 150c, Godox SL-60W",
  },
  {
    id: "led_panel",
    name: "LED Panel",
    emoji: "⬛",
    examples: "เช่น Aputure MT Pro, Godox P600R, LED Panel 100W",
  },
  {
    id: "tube_light",
    name: "Tube Light",
    emoji: "🔦",
    examples: "เช่น Nanlite Pavotube, Godox TL60, RGBWW Tube",
  },
  {
    id: "hmi",
    name: "HMI / Fresnel",
    emoji: "☀️",
    examples: "เช่น HMI 575W, Fresnel 300W, ARRI Studio",
  },
  {
    id: "softbox",
    name: "Softbox / Modifier",
    emoji: "⬜",
    examples: "เช่น Softbox 60x90, Octabox 120cm, Beauty Dish",
  },
  {
    id: "stand",
    name: "ขาตั้ง / Boom Arm",
    emoji: "🦺",
    examples: "เช่น C-Stand 3ขา, Light Stand 2ม., Boom Arm",
  },
  {
    id: "gobo",
    name: "โกโบ้ / Flag / Cutter",
    emoji: "🎭",
    examples: "เช่น Flag ดำ 60x90, Cutter, Gobo Head",
  },
  {
    id: "other",
    name: "อื่นๆ",
    emoji: "🎨",
    examples: "เช่น Color Gel, Diffusion Silk, Reflector",
  },
];

export default function EquipmentSelector({ equipment = {}, onChange }) {
  const [open, setOpen] = useState(false);

  const handleChange = (id, value) => {
    onChange({ ...equipment, [id]: value });
  };

  const filled = EQUIPMENT_TYPES.filter(e => equipment[e.id]?.trim());
  const hasAny = filled.length > 0;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#475569", fontWeight: 600, marginBottom: 10 }}>
        STEP 2.5 — อุปกรณ์ที่คุณมี
      </div>

      {/* Summary box */}
      <div style={{ background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
        {!hasAny ? (
          <div style={{ fontSize: 12, color: "#334155", fontStyle: "italic" }}>
            ยังไม่ได้ระบุอุปกรณ์ — AI จะแนะนำแบบทั่วไป
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filled.map(e => (
              <div key={e.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{e.emoji}</span>
                <div>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 1 }}>{e.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{equipment[e.id]}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          background: "#0d1117", border: "1px solid #1e293b", borderRadius: 8,
          padding: "10px 16px", color: "#94a3b8", fontSize: 13, cursor: "pointer",
          width: "100%", fontFamily: "inherit", textAlign: "left",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}
      >
        <span>✏️ {hasAny ? "แก้ไขอุปกรณ์" : "กรอกอุปกรณ์ที่มี"}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {/* Input panel */}
      {open && (
        <div style={{ background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 10, padding: 16, marginTop: 8 }}>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 14, lineHeight: 1.6 }}>
            กรอกรุ่น/จำนวนอุปกรณ์ที่มี AI จะแนะนำการวางไฟตามอุปกรณ์จริงของคุณ
          </div>
          {EQUIPMENT_TYPES.map(eq => (
            <div key={eq.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 15 }}>{eq.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1" }}>{eq.name}</span>
              </div>
              <input
                type="text"
                value={equipment[eq.id] || ""}
                onChange={e => handleChange(eq.id, e.target.value)}
                placeholder={eq.examples}
                style={{
                  width: "100%", background: "#0d1117", border: "1px solid #1e293b",
                  borderRadius: 8, padding: "10px 12px", color: "#e2e8f0",
                  fontSize: 12, fontFamily: "inherit", boxSizing: "border-box"
                }}
              />
            </div>
          ))}
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none",
              borderRadius: 8, padding: "10px 20px", color: "white",
              fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit"
            }}
          >
            ✓ บันทึกอุปกรณ์
          </button>
        </div>
      )}
    </div>
  );
}