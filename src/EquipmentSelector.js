import { useState } from "react";

const EQUIPMENT_TYPES = [
  { id: "led_cob", name: "LED COB", emoji: "💡", placeholder: "เช่น Aputure 600d" },
  { id: "led_panel", name: "LED Panel", emoji: "⬛", placeholder: "เช่น Godox P600R" },
  { id: "tube_light", name: "Tube Light", emoji: "🔦", placeholder: "เช่น Nanlite Pavotube" },
  { id: "hmi", name: "HMI / Fresnel", emoji: "☀️", placeholder: "เช่น HMI 575W" },
  { id: "softbox", name: "Softbox / Modifier", emoji: "⬜", placeholder: "เช่น Softbox 60x90" },
  { id: "stand", name: "ขาตั้ง / Boom Arm", emoji: "🦺", placeholder: "เช่น C-Stand" },
  { id: "gobo", name: "โกโบ้ / Flag", emoji: "🎭", placeholder: "เช่น Flag ดำ 60x90" },
  { id: "other", name: "อื่นๆ", emoji: "🎨", placeholder: "เช่น Color Gel, Reflector" },
];

const emptyItem = () => ({ model: "", qty: 1 });

export default function EquipmentSelector({ equipment = {}, onChange }) {
  const [open, setOpen] = useState(false);

  // equipment = { led_cob: [{model, qty}, ...], ... }
  const getItems = (id) => equipment[id] || [];

  const handleItemChange = (catId, index, field, value) => {
    const items = [...getItems(catId)];
    items[index] = { ...items[index], [field]: value };
    onChange({ ...equipment, [catId]: items });
  };

  const addItem = (catId) => {
    const items = [...getItems(catId), emptyItem()];
    onChange({ ...equipment, [catId]: items });
  };

  const removeItem = (catId, index) => {
    const items = getItems(catId).filter((_, i) => i !== index);
    onChange({ ...equipment, [catId]: items });
  };

  const hasAny = EQUIPMENT_TYPES.some(e => getItems(e.id).some(i => i.model.trim()));

  const summary = EQUIPMENT_TYPES.flatMap(e =>
    getItems(e.id).filter(i => i.model.trim()).map(i => `${e.emoji} ${i.model} ${i.qty}ดวง/ชิ้น`)
  );

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
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {summary.map((s, i) => (
              <div key={i} style={{ fontSize: 12, color: "#94a3b8" }}>{s}</div>
            ))}
          </div>
        )}
      </div>

      {/* Toggle */}
      <button onClick={() => setOpen(p => !p)} style={{
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
          <div style={{ fontSize: 11, color: "#475569", marginBottom: 14 }}>
            กรอกรุ่นและจำนวนอุปกรณ์ที่มี AI จะวางแผนการจัดแสงตามอุปกรณ์จริงของคุณ
          </div>

          {EQUIPMENT_TYPES.map(cat => (
            <div key={cat.id} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 15 }}>{cat.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#cbd5e1" }}>{cat.name}</span>
              </div>

              {getItems(cat.id).map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <input
                    type="text"
                    value={item.model}
                    onChange={e => handleItemChange(cat.id, idx, "model", e.target.value)}
                    placeholder={cat.placeholder}
                    style={{
                      flex: 1, background: "#0d1117", border: "1px solid #1e293b",
                      borderRadius: 8, padding: "8px 10px", color: "#e2e8f0",
                      fontSize: 12, fontFamily: "inherit", boxSizing: "border-box"
                    }}
                  />
                  <input
                    type="number"
                    value={item.qty}
                    min={1} max={20}
                    onChange={e => handleItemChange(cat.id, idx, "qty", parseInt(e.target.value) || 1)}
                    style={{
                      width: 52, background: "#0d1117", border: "1px solid #1e293b",
                      borderRadius: 8, padding: "8px 6px", color: "#e2e8f0",
                      fontSize: 12, fontFamily: "inherit", textAlign: "center"
                    }}
                  />
                  <span style={{ fontSize: 10, color: "#475569" }}>ดวง</span>
                  <button onClick={() => removeItem(cat.id, idx)} style={{
                    background: "none", border: "1px solid #374151", borderRadius: 6,
                    color: "#ef4444", fontSize: 14, cursor: "pointer", padding: "4px 8px",
                    fontFamily: "inherit"
                  }}>✕</button>
                </div>
              ))}

              <button onClick={() => addItem(cat.id)} style={{
                background: "none", border: "1px dashed #1e293b", borderRadius: 8,
                padding: "7px 12px", color: "#475569", fontSize: 12, cursor: "pointer",
                width: "100%", fontFamily: "inherit"
              }}>
                ➕ เพิ่ม{cat.name}
              </button>
            </div>
          ))}

          <button onClick={() => setOpen(false)} style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none",
            borderRadius: 8, padding: "10px 20px", color: "white",
            fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%",
            fontFamily: "inherit", marginTop: 8
          }}>
            ✓ บันทึกอุปกรณ์
          </button>
        </div>
      )}
    </div>
  );
}