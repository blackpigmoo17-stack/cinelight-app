export default function CameraOverlay({ videoRef, onCapture, onClose }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "#000", zIndex: 9999, touchAction: "none",
      userSelect: "none", overflow: "hidden",
    }}>
      <video
        ref={videoRef} autoPlay playsInline muted
        style={{
          position: "fixed", top: 0, left: 0,
          width: "100vw", height: "100vh",
          objectFit: "cover", zIndex: 1,
        }}
      />
      <button
        onClick={onClose}
        style={{
          position: "fixed", top: 24, left: 20, zIndex: 9999,
          background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 30, padding: "10px 20px", color: "white",
          fontSize: 15, fontWeight: 700, cursor: "pointer",
        }}
      >✕</button>
      <div style={{
        position: "fixed", top: 24, right: 20, zIndex: 9999,
        background: "rgba(0,0,0,0.55)", borderRadius: 8,
        padding: "8px 12px", fontSize: 12, color: "rgba(255,255,255,0.8)",
      }}>จัดเฟรมแล้วกด ⭕</div>
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
        display: "flex", justifyContent: "center", alignItems: "center",
        paddingBottom: 40, paddingTop: 20,
        background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
      }}>
        <button
          onClick={onCapture}
          style={{
            width: 84, height: 84, borderRadius: "50%",
            background: "transparent", border: "5px solid white",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 0, WebkitTapHighlightColor: "transparent",
          }}
        >
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: "white" }} />
        </button>
      </div>
    </div>
  );
}
