 const SAMPLES = [
  {
    emoji: "🌅", label: "Golden Hour", ratio: "3:1",
    ratioColor: "#f59e0b", ratioText: "#78350f",
    desc: "Key Light 45° ด้านขวาบน ติดเจล CTO 3200K เลียนแบบแสงยามเย็น bounce reflector สีทองด้านตรงข้าม",
    fStop: "f/1.8", iso: "ISO 200", shutter: "1/250s",
  },
  {
    emoji: "🎭", label: "Film Noir", ratio: "8:1",
    ratioColor: "#ef4444", ratioText: "#7f1d1d",
    desc: "Hard Key 90° ด้านข้าง ไม่มี fill เงาหนักสร้าง drama ซ่อนไฟในตู้หนังสือหรือใต้โต๊ะ",
    fStop: "f/4.0", iso: "ISO 800", shutter: "1/100s",
  },
  {
    emoji: "📽️", label: "Documentary", ratio: "2:1",
    ratioColor: "#84cc16", ratioText: "#365314",
    desc: "ใช้หน้าต่างเป็น key light หลัก reflector ขาวด้านตรงข้าม ดูธรรมชาติไม่ตั้งใจ",
    fStop: "f/2.8", iso: "ISO 1600", shutter: "1/60s",
  },
];

export default function LandingShowcase() {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#475569", fontWeight: 600, marginBottom: 12 }}>
        ตัวอย่างผลลัพธ์จาก AI
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10, marginBottom: 12 }}>
        {SAMPLES.map((s) => (
          <div key={s.label} style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 10, padding: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{s.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{s.label}</span>
              <span style={{
                marginLeft: "auto", fontSize: 11, fontWeight: 700,
                background: s.ratioColor + "22", color: s.ratioColor,
                padding: "2px 8px", borderRadius: 4,
              }}>{s.ratio}</span>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, margin: "0 0 10px" }}>{s.desc}</p>
            <div style={{ borderTop: "1px solid #1e293b", paddingTop: 8, display: "flex", gap: 10 }}>
              {[s.fStop, s.iso, s.shutter].map((v) => (
                <span key={v} style={{ fontSize: 11, color: "#475569", fontFamily: "DM Mono,monospace" }}>{v}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 18px" }}>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 6 }}>🎥 PRO TIP ตัวอย่างจาก AI</div>
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, margin: 0 }}>
          ผนังสีขาวในฉากสามารถใช้เป็น natural bounce ได้ดีมาก — วาง LED Panel ชี้ไปที่ผนังแทนที่จะชี้ตรงซับเจกต์ จะได้แสงนุ่มกว่า softbox ราคาแพง
        </p>
      </div>
    </div>
  );
}
