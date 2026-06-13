import LightingDiagram3D from "./LightingDiagram3D";

export default function LightingPreset({ preset, mood, analysis, imageBase64 }) {
  if (!preset || !mood) return null;

  const diagramLights =
    analysis?.light_placement_detail?.length > 0
      ? analysis.light_placement_detail.map((l) => ({
          name: l.light_name,
          pos: l.distance || "",
          temp: "",
          power: "",
          type: l.equipment_to_use || "",
          icon: "💡",
          angle_deg: l.angle_deg,
          target_subject_id: l.target_subject_id,
        }))
      : preset.lights;

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div className="section-title" style={{ margin: 0 }}>
          LIGHTING SETUP — {mood.label.toUpperCase()}
        </div>
        <div style={{
          background: "#0f172a", border: "1px solid #334155", borderRadius: 6,
          padding: "6px 14px", display: "inline-flex", flexDirection: "column", alignItems: "center",
        }}>
          <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>RATIO</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: mood.color, fontFamily: "DM Mono" }}>
            {preset.ratio}
          </div>
        </div>
      </div>

      {/* Light cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 10, marginBottom: 14 }}>
        {preset.lights.map((light, i) => (
          <div key={i} className="light-card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{light.icon}</span>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{light.name}</div>
              <span className="tag" style={{ marginLeft: "auto" }}>#{i + 1}</span>
            </div>
            {[
              ["ตำแหน่ง", light.pos, "#94a3b8"],
              ["อุณหภูมิ", light.temp, mood.color],
              ["กำลัง", light.power, "#94a3b8"],
              ["ชนิดไฟ", light.type, "#64748b"],
            ].map(([label, val, col]) => (
              <div key={label} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: "#475569", width: 50, flexShrink: 0 }}>{label}</span>
                <span style={{
                  fontSize: 11, color: col,
                  fontFamily: label === "อุณหภูมิ" ? "DM Mono" : "inherit",
                  fontWeight: label === "อุณหภูมิ" ? 600 : 400,
                }}>{val}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Diagram */}
      <LightingDiagram3D
        lights={diagramLights}
        moodColor={mood.color}
        subjects={analysis?.subjects || []}
        imageBase64={imageBase64}
      />

      {/* Camera settings */}
      <div style={{
        background: "#0a0f1a", border: "1px solid #1e293b",
        borderRadius: 10, padding: "14px 18px",
        display: "flex", gap: 20, flexWrap: "wrap",
      }}>
        {[
          ["F-STOP", preset.fStop, "#60a5fa"],
          ["ISO", preset.iso, "#a78bfa"],
          ["SHUTTER", preset.shutter, "#34d399"],
        ].map(([label, val, col]) => (
          <div key={label}>
            <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: "DM Mono", fontSize: 16, fontWeight: 600, color: col }}>{val}</div>
          </div>
        ))}
        <div style={{ borderLeft: "1px solid #1e293b", paddingLeft: 20, flex: 1 }}>
          <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1, marginBottom: 4 }}>PRO TIP</div>
          <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>{preset.tips}</div>
        </div>
      </div>
    </div>
  );
}
