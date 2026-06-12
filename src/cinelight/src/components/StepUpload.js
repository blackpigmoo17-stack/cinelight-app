import { useRef } from "react";

export default function StepUpload({ uploadedImage, sceneDescription, cameraError, onOpenCamera, onFileUpload, onDescriptionChange }) {
  const fileRef = useRef();

  return (
    <div style={{ marginBottom: 28 }}>
      <div className="section-title">STEP 1 — ถ่ายหรืออัปโหลดเฟรม</div>
      {cameraError && (
        <div style={{
          background: "#1f0a0a", border: "1px solid #7f1d1d",
          borderRadius: 8, padding: "10px 14px", marginBottom: 12,
          fontSize: 12, color: "#fca5a5",
        }}>{cameraError}</div>
      )}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button
          className="cam-btn"
          style={{
            flex: 1, background: "linear-gradient(135deg,#1e3a5f,#0f2040)",
            color: "#60a5fa", border: "1px solid #1e3a5f", fontSize: 15,
          }}
          onClick={onOpenCamera}
        >📷 เปิดกล้อง</button>
        <button
          className="cam-btn"
          style={{ flex: 1, background: "#0d1117", color: "#94a3b8", border: "1px solid #1e293b", fontSize: 15 }}
          onClick={() => fileRef.current.click()}
        >🖼️ เลือกจากคลัง</button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFileUpload} />
      {uploadedImage && (
        <div style={{ textAlign: "center" }}>
          <img
            src={uploadedImage} alt="frame"
            style={{
              maxHeight: 220, maxWidth: "100%", borderRadius: 10,
              objectFit: "contain", border: "1px solid #1e293b",
            }}
          />
          <div style={{ marginTop: 6, fontSize: 12, color: "#60a5fa" }}>
            ✓ โหลดภาพแล้ว — กดปุ่มด้านบนเพื่อถ่ายใหม่
          </div>
          <div style={{ marginTop: 10 }}>
            <textarea
              value={sceneDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="อธิบายฉาก เช่น ตัวละคร 2 คนนั่งคุยกัน, subject ยืนหน้าต่างมองวิว, นักดนตรีบนเวที..."
              rows={3}
              style={{
                width: "100%", background: "#0d1117", border: "1px solid #1e293b",
                borderRadius: 8, padding: "10px 12px", color: "#e2e8f0",
                fontSize: 13, fontFamily: "inherit", resize: "vertical",
                lineHeight: 1.6, boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
