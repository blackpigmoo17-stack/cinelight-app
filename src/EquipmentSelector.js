import { useState, useEffect } from "react";

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

const STORAGE_KEY = "cinelight_equipment_history";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch { return {}; }
}

function saveHistory(catId, model) {
  if (!model.trim()) return;
  try {
    const h = loadHistory();
    const list = h[catId] || [];
    const updated = [model, ...list.filter(m => m !== model)].slice(0, 8);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...h, [catId]: updated }));
  } catch {}
}

export default function EquipmentSelector({ equipment = {}, onChange }) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null); // { catId, index } หรือ null
  const [modalModel, setModalModel] = useState("");
  const [modalQty, setModalQty] = useState(1);
  const [history, setHistory] = useState({});

  useEffect(() => { setHistory(loadHistory()); }, []);

  const getItems = (id) => equipment[id] || [];

  const openModal = (catId, index) => {
    const item = getItems(catId)[index] || { model: "", qty: 1 };
    setModal({ catId, index });
    setModalModel(item.model);
    setModalQty(item.qty);
    setHistory(loadHistory());
  };

  const closeModal = () => setModal(null);

  const confirmModal = () => {
    if (!modal) return;
    const { catId, index } = modal;
    const items = [...getItems(catId)];
    if (index === -1) {
      items.push({ model: modalModel, qty: modalQty });
    } else {
      items[index] = { model: modalModel, qty: modalQty };
    }
    saveHistory(catId, modalModel);
    setHistory(loadHistory());
    onChange({ ...equipment, [catId]: items });
    closeModal();
  };

  const removeItem = (catId, index) => {
    const items = getItems(catId).filter((_, i) => i !== index);
    onChange({ ...equipment, [catId]: items });
  };

  const hasAny = EQUIPMENT_TYPES.some(e => getItems(e.id).some(i => i.model.trim()));
  const summary = EQUIPMENT_TYPES.flatMap(e =>
    getItems(e.id).filter(i => i.model.trim()).map(i => `${e.emoji} ${i.model} ${i.qty}ดวง/ชิ้น`)
  );

  const modalCat = modal ? EQUIPMENT_TYPES.find(e => e.id === modal.catId) : null;
  const modalHistory = modal ? (history[modal.catId] || []) : [];

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
                  <button
                    onClick={() => openModal(cat.id, idx)}
                    style={{
                      flex: 1, background: "#0d1117", border: "1px solid #1e293b",
                      borderRadius: 8, padding: "8px 10px", color: item.model ? "#e2e8f0" : "#334155",
                      fontSize: 12, fontFamily: "inherit", textAlign: "left", cursor: "pointer"
                    }}
                  >
                    {item.model || cat.placeholder}
                  </button>
                  <div style={{
                    background: "#0d1117", border: "1px solid #1e293b",
                    borderRadius: 8, padding: "8px 6px", color: "#e2e8f0",
                    fontSize: 12, minWidth: 52, textAlign: "center"
                  }}>
                    {item.qty} ดวง
                  </div>
                  <button onClick={() => removeItem(cat.id, idx)} style={{
                    background: "none", border: "1px solid #374151", borderRadius: 6,
                    color: "#ef4444", fontSize: 14, cursor: "pointer", padding: "4px 8px",
                    fontFamily: "inherit"
                  }}>✕</button>
                </div>
              ))}

              <button onClick={() => openModal(cat.id, -1)} style={{
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

      {/* Modal */}
      {modal && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 16
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#0d1117", border: "1px solid #1e293b", borderRadius: 14,
              padding: 20, width: "100%", maxWidth: 340
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
                {modalCat?.emoji} {modalCat?.name}
              </div>
              <button onClick={closeModal} style={{
                background: "none", border: "none", color: "#475569",
                fontSize: 20, cursor: "pointer", padding: 0, lineHeight: 1
              }}>×</button>
            </div>

            {/* Recent history */}
            {modalHistory.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>
                  ที่เคยใช้
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {modalHistory.map((m, i) => (
                    <button
                      key={i}
                      onClick={() => setModalModel(m)}
                      style={{
                        background: modalModel === m ? "#1e3a5f" : "#0a0f1a",
                        border: `1px solid ${modalModel === m ? "#3b82f6" : "#1e293b"}`,
                        borderRadius: 6, padding: "5px 10px",
                        color: modalModel === m ? "#60a5fa" : "#64748b",
                        fontSize: 11, cursor: "pointer", fontFamily: "inherit"
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>รุ่น / ชื่ออุปกรณ์</div>
              <input
                type="text"
                value={modalModel}
                onChange={e => setModalModel(e.target.value)}
                placeholder={modalCat?.placeholder}
                autoFocus
                style={{
                  width: "100%", background: "#060a12", border: "1px solid #1e293b",
                  borderRadius: 8, padding: "10px 12px", color: "#e2e8f0",
                  fontSize: 13, fontFamily: "inherit", boxSizing: "border-box"
                }}
              />
            </div>

            {/* Qty */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>จำนวน</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => setModalQty(q => Math.max(1, q - 1))}
                  style={{
                    background: "#0a0f1a", border: "1px solid #1e293b",
                    borderRadius: 8, width: 36, height: 36, color: "#94a3b8",
                    fontSize: 18, cursor: "pointer", fontFamily: "inherit"
                  }}
                >−</button>
                <span style={{ fontSize: 18, fontWeight: 600, color: "#e2e8f0", minWidth: 30, textAlign: "center" }}>
                  {modalQty}
                </span>
                <button
                  onClick={() => setModalQty(q => Math.min(20, q + 1))}
                  style={{
                    background: "#0a0f1a", border: "1px solid #1e293b",
                    borderRadius: 8, width: 36, height: 36, color: "#94a3b8",
                    fontSize: 18, cursor: "pointer", fontFamily: "inherit"
                  }}
                >+</button>
                <span style={{ fontSize: 12, color: "#475569" }}>ดวง / ชิ้น</span>
              </div>
            </div>

            {/* Confirm */}
            <button
              onClick={confirmModal}
              disabled={!modalModel.trim()}
              style={{
                width: "100%", padding: "11px", borderRadius: 8, border: "none",
                background: modalModel.trim() ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "#1e293b",
                color: modalModel.trim() ? "white" : "#475569",
                fontSize: 14, fontWeight: 600, cursor: modalModel.trim() ? "pointer" : "default",
                fontFamily: "inherit"
              }}
            >
              ✓ ยืนยัน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}