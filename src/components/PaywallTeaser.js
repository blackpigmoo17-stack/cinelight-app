import { useState } from "react";

const SAMPLE_RESULT = {
  scene_analysis: "ห้องนั่งเล่นแสงธรรมชาติจากหน้าต่างด้านซ้าย มีผนังสีขาวช่วย bounce แสงได้ดี ซับเจกต์ยืนห่างจากหน้าต่าง 1.5 เมตร แสงตกกระทบด้านซ้ายสร้าง natural key light อยู่แล้ว",
  lighting_recommendation: "ใช้หน้าต่างเป็น key light หลัก เพิ่ม reflector ด้านขวาเพื่อ fill เงา วาง LED panel เบาๆ ด้านหลังเพื่อ rim light แยกซับเจกต์ออกจากฉากหลัง",
  key_challenge: "แสงธรรมชาติเปลี่ยนตลอด ควรถ่ายในช่วงเวลาเดิมทุกวัน หรือใช้ ND filter ที่หน้าต่างเพื่อ control intensity",
  pro_tip: "วาง bounce card ขนาด 60x90cm ห่างจากซับเจกต์ 80cm ด้านขวา จะได้ ratio 3:1 ที่ flattering มาก",
};

export default function PaywallTeaser({ onUnlock }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showEmail, setShowEmail] = useState(false);

  const handleUpgrade = async () => {
    if (!email || !email.includes("@")) {
      setError("กรุณาใส่ email ที่ถูกต้อง");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    }
    setLoading(false);
  };

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
          background: "linear-gradient(to bottom, transparent 0%, rgba(8,12,20,0.92) 35%)",
          borderRadius: 12, padding: "0 24px",
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 4, textAlign: "center" }}>
            ปลดล็อก AI Analysis
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16, textAlign: "center", lineHeight: 1.6 }}>
            วิเคราะห์ฉากจริงด้วย AI ระดับ Hollywood<br />
            <span style={{ color: "#f59e0b", fontWeight: 600 }}>฿249/เดือน</span> · ยกเลิกได้ทุกเมื่อ
          </div>

          {!showEmail ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
              <button
                onClick={() => setShowEmail(true)}
                style={{
                  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                  border: "none", borderRadius: 8,
                  padding: "12px 28px", color: "white",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                }}
              >⚡ อัปเกรดเป็น Pro — ฿249/เดือน</button>
              <button
                onClick={onUnlock}
                style={{
                  background: "transparent",
                  border: "1px solid #334155", borderRadius: 8,
                  padding: "10px 28px", color: "#64748b",
                  fontSize: 13, cursor: "pointer",
                }}
              >🔑 มี API Key อยู่แล้ว</button>
            </div>
          ) : (
            <div style={{ width: "100%", maxWidth: 300 }}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginBottom: 8, textAlign: "center" }}
              />
              {error && <div style={{ fontSize: 11, color: "#fca5a5", marginBottom: 8, textAlign: "center" }}>{error}</div>}
              <button
                onClick={handleUpgrade}
                disabled={loading}
                style={{
                  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                  border: "none", borderRadius: 8,
                  padding: "12px", color: "white", width: "100%",
                  fontSize: 14, fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >{loading ? "กำลังโหลด..." : "ไปหน้าชำระเงิน →"}</button>
              <div style={{ fontSize: 10, color: "#334155", textAlign: "center", marginTop: 8 }}>
                ชำระผ่าน Stripe · ปลอดภัย 100%
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
