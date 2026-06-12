export default function Header({ step, apiKey, onOpenApiModal }) {
  return (
    <div style={{
      borderBottom: "1px solid #0f1929", padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 12,
      background: "#060a12", position: "sticky", top: 0, zIndex: 10,
    }}>
      <div style={{
        width: 36, height: 36,
        background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
        borderRadius: 8, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 18,
      }}>🎬</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.5px" }}>CineLight AI</div>
        <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.5px" }}>PROFESSIONAL LIGHTING DESIGNER</div>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={onOpenApiModal}
          style={{
            background: "none", border: "1px solid #1e293b", borderRadius: 6,
            padding: "4px 10px", color: "#475569", fontSize: 11, cursor: "pointer",
          }}
        >
          {apiKey ? "🔑 API" : "🔑 ตั้งค่า API"}
        </button>
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`step-num ${step >= n ? "active" : ""}`}>{n}</div>
        ))}
      </div>
    </div>
  );
}
