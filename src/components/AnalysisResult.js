export default function AnalysisResult({ analysis }) {
  if (!analysis) return null;

  const cards = [
    { key: "scene_analysis", icon: "📍", label: "วิเคราะห์ฉาก", color: "#cbd5e1", borderColor: "#1e293b" },
    { key: "lighting_recommendation", icon: "💡", label: "คำแนะนำการวางไฟ", color: "#93c5fd", borderColor: "#1e3a5f" },
    { key: "creative_opportunities", icon: "✨", label: "โอกาสพิเศษในฉากนี้", color: "#34d399", borderColor: "#1a3a2a" },
    { key: "key_challenge", icon: "⚠️", label: "ความท้าทายที่ต้องระวัง", color: "#fca5a5", borderColor: "#3d1f1f" },
    { key: "pro_tip", icon: "🎥", label: "Pro Tip จาก DOP", color: "#86efac", borderColor: "#1a2d1a" },
    { key: "budget_tip", icon: "💰", label: "ประหยัดงบ", color: "#fde68a", borderColor: "#2d2a1a" },
  ];

  return (
    <div>
      {cards.map(({ key, icon, label, color, borderColor }) =>
        analysis[key] ? (
          <div key={key} className="analysis-card" style={{ borderColor }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>
              {icon} {label}
            </div>
            <div style={{ fontSize: 13, color, lineHeight: 1.7 }}>{analysis[key]}</div>
          </div>
        ) : null
      )}

      {/* Environment block */}
      {analysis.environment && (
        <div className="analysis-card" style={{ borderColor: "#1a2a3a" }}>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 10 }}>🏠 สภาพแวดล้อม</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              ["📍 สถานที่", analysis.environment.room_type],
              ["☀️ แสงธรรมชาติ", analysis.environment.natural_light],
              ["🪞 พื้นผิว bounce", analysis.environment.surfaces],
              ["🪑 เฟอร์นิเจอร์", analysis.environment.furniture],
              ["🔦 จุดซ่อนไฟ", analysis.environment.hide_spots],
            ]
              .filter(([, v]) => v)
              .map(([label, val]) => (
                <div key={label} style={{ background: "#0a0f1a", borderRadius: 6, padding: "6px 8px" }}>
                  <div style={{ fontSize: 9, color: "#475569", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>{val}</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Light placement detail */}
      {analysis.light_placement_detail?.length > 0 && (
        <div className="analysis-card" style={{ borderColor: "#1a2d3a" }}>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 12 }}>
            🎯 รายละเอียดการวางไฟแต่ละดวง
          </div>
          {analysis.light_placement_detail.map((l, i) => (
            <div key={i} style={{
              background: "#060a12", borderRadius: 8, padding: "12px",
              marginBottom: 10, border: "1px solid #1e293b",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", marginBottom: 8 }}>
                💡 {l.light_name}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[
                  ["🔧 อุปกรณ์", l.equipment_to_use],
                  ["📏 ระยะห่าง", l.distance],
                  ["🦺 ขาตั้ง", l.stand_type],
                  ["📐 มุมก้ม", l.angle],
                  ["↕️ ความสูง", l.stand_height],
                  ["✨ Modifier", l.modifier],
                ]
                  .filter(([, v]) => v)
                  .map(([label, val]) => (
                    <div key={label} style={{ background: "#0a0f1a", borderRadius: 6, padding: "6px 8px" }}>
                      <div style={{ fontSize: 9, color: "#475569", marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>{val}</div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
