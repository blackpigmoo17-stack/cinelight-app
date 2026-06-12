import { useState } from "react";

export default function ApiKeyModal({ apiKey, onSave, onClose }) {
  const [value, setValue] = useState(apiKey || "");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000cc",
      zIndex: 50, display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "#0d1117", border: "1px solid #1e293b",
        borderRadius: 16, padding: 28, width: "100%", maxWidth: 420,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>🔑 ใส่ Anthropic API Key</div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16, lineHeight: 1.6 }}>
          สร้าง API Key ได้ที่{" "}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: "#60a5fa" }}>
            console.anthropic.com
          </a>
          <br />Key จะถูกเก็บไว้ใน localStorage บนเครื่องของคุณเท่านั้น
        </div>
        <input
          type="password"
          placeholder="sk-ant-..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="cam-btn"
            style={{ background: "#1e293b", color: "#94a3b8", flex: 1 }}
            onClick={onClose}
          >ยกเลิก</button>
          <button
            className="cam-btn"
            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", color: "white", flex: 1 }}
            onClick={() => onSave(value)}
          >บันทึก</button>
        </div>
      </div>
    </div>
  );
}
