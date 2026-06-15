const SAMPLE_RESULT = {
  scene_analysis: "ห้องนั่งเล่นแสงธรรมชาติจากหน้าต่างด้านซ้าย มีผนังสีขาวช่วย bounce แสงได้ดี ซับเจกต์ยืนห่างจากหน้าต่าง 1.5 เมตร แสงตกกระทบด้านซ้ายสร้าง natural key light อยู่แล้ว",
  lighting_recommendation: "ใช้หน้าต่างเป็น key light หลัก เพิ่ม reflector ด้านขวาเพื่อ fill เงา วาง LED panel เบาๆ ด้านหลังเพื่อ rim light แยกซับเจกต์ออกจากฉากหลัง",
  key_challenge: "แสงธรรมชาติเปลี่ยนตลอด ควรถ่ายในช่วงเวลาเดิมทุกวัน หรือใช้ ND filter ที่หน้าต่างเพื่อ control intensity",
  pro_tip: "วาง bounce card ขนาด 60x90cm ห่างจากซับเจกต์ 80cm ด้านขวา จะได้ ratio 3:1 ที่ flattering มาก",
};

export default function PaywallTeaser({ onUnlock }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="section-title">STEP 4 — วิเคราะห์ฉากด้วย AI</div>

      {/* Blur preview */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none", opacity: 0.7 }}>
          {Object.entries({
            "📍 วิเคราะห์ฉาก": SAMPLE_RESULT.scene_analysis,
            "💡 คำแนะนำการวางไฟ": SAMPLE_RESULT.lighting_recommendation,
            "⚠️ ความท้าทาย": SAMPLE_RESULT.key_challenge,
            "🎥 Pro Tip จาก DOP": SAMPLE_RESULT.pro_tip,
          }).map(([label, text]) => (
            <div key={label} className="analysis-card" style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>{text}</div>
            </div>
          ))}
        </div>

        {/* Overlay CTA */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(to bottom, transparent 0%, rgba(8,12,20,0.85) 40%)",
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 6, textAlign: "center" }}>
            ปลดล็อก AI Analysis
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 20, textAlign: "center", maxWidth: 260, lineHeight: 1.6 }}>
            ใส่ Anthropic API Key เพื่อวิเคราะห์ฉากจริง<br />รับคำแนะนำการวางไฟจาก AI ระดับ Hollywood
          </div>
          <button
            onClick={onUnlock}
            style={{
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              border: "none", borderRadius: 8,
              padding: "12px 28px", color: "white",
              fontSize: 14, fontWeight: 700,
              cursor: "pointer", marginBottom: 10,
            }}
          >
            🔑 ใส่ API Key เพื่อปลดล็อก
          </button>
          <div style={{ fontSize: 10, color: "#334155" }}>
            สมัคร Anthropic ฟรี · ไม่เก็บ key ในเซิร์ฟเวอร์
          </div>
        </div>
      </div>
    </div>
  );
}
