import { useState } from "react";

const CATEGORIES = [
  {
    id: "main_lights",
    name: "ไฟหลัก",
    emoji: "💡",
    placeholder: "เช่น Aputure 600d 1ดวง, Amaran 150c 2ดวง, LED Panel 100w 1ดวง",
  },
  {
    id: "modifiers",
    name: "Modifier / อุปกรณ์เสริมไฟ",
    emoji: "⬜",
    placeholder: "เช่น Softbox 60x90 1ชุด, Octabox 120cm 1ชุด, Reflector ขาว 1ชิ้น",
  },
  {
    id: "stands",
    name: "ขาตั้ง / โครงสร้าง",
    emoji: "🦺",
    placeholder: "เช่น C-Stand 3ขา, Light Stand สูง 2ม. 2ขา, Boom Arm 1ชิ้น",
  },
  {
    id: "accessories",
    name: "อุปกรณ์เสริมอื่นๆ",
    emoji: "🎨",
    placeholder: "เช่น Color Gel ชุด CTO/CTB, Diffusion Silk 1ชิ้น, Flag/Cutter 2ชิ้น",
  },
  {
    id: "natural",
    name: "แสงธรรมชาติ / สภาพแวดล้อม",
    emoji: "🌤️",
    placeholder: "เช่น หน้าต่างขนาดใหญ่ทิศตะวันออก, ถ่ายกลางแจ้ง, ห้องมีไฟเพดาน",
  },
];

export default function EquipmentSelector({ equipment, onChange }) {
  const [open, setOpen] = useState(false);

  const handleChange = (catId, value) => {
    onChange({ ...equipment, [catId]: value });
  };

  const hasAny = Object.values(equipment).some(v => v && v.trim());

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#475569", fontWeight: 600, marginBottom: 10 }}>
        STEP 2.5 — อุปกรณ์ที่คุณมี
      </div>

      {/* Summary */}
      <div style={{ background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
        {!hasAny ? (
          <div style={{ fontSize: 12, color: "#334155", fontStyle: "italic" }}>
            ยังไม่ได้ระบุอุปกรณ์ — AI จะแนะนำแบบทั่วไป
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {CATEGORIES.filter(c => equipment[c.id]?.trim()).map(c => (
              <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{c.emoji}</span>
                <div>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 1 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{equipment[c.id]}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={() => setOpen(!open)} style={{
        background: "#0d1117", border: "1px solid #1e293b", borderRadius: 8,
        padding: "10px 16px", color: "#94a3b8", fontSize: 13, cursor: "pointer",
        width: "100%", fontFamily: "inherit", textAlign: "left",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span>✏️ {hasAny ? "แก้ไขอุปกรณ์" : "กรอกอุปกรณ์ที่มี"}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 10, padding: 16, marginTop: 8 }}>
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 14, lineHeight: 1.6 }}>
            กรอกอุปกรณ์ที่คุณมีในแต่ละหมวด AI จะแนะนำการใช้งานตามอุปกรณ์จริงของคุณ
          </div>
          {CATEGORIES.map(cat => (
            <div key={cat.id} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1" }}>{cat.name}</span>
              </div>
              <textarea
                value={equipment[cat.id] || ""}
                onChange={e => handleChange(cat.id, e.target.value)}
                placeholder={cat.placeholder}
                rows={2}
                style={{
                  width: "100%", background: "#0d1117", border: "1px solid #1e293b",
                  borderRadius: 8, padding: "10px 12px", color: "#e2e8f0",
                  fontSize: 12, fontFamily: "inherit", resize: "vertical",
                  lineHeight: 1.6, boxSizing: "border-box"
                }}
              />
            </div>
          ))}
          <button onClick={() => setOpen(false)} style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none",
            borderRadius: 8, padding: "10px 20px", color: "white",
            fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit"
          }}>
            ✓ บันทึกอุปกรณ์
          </button>
        </div>
      )}
    </div>
  );
}
