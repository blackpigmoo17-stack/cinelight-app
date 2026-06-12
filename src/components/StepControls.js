import { SHOT_TYPES } from "../constants/shotTypes";
import { MOODS } from "../constants/moods";

export function StepShot({ selectedShot, onChange }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="section-title">STEP 2 — ประเภทช็อต</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SHOT_TYPES.map((s) => (
          <button
            key={s}
            className={`shot-btn ${selectedShot === s ? "sel" : ""}`}
            onClick={() => onChange(s)}
          >{s}</button>
        ))}
      </div>
    </div>
  );
}

export function StepMood({ selectedMood, onChange }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div className="section-title">STEP 3 — เลือกอารมณ์ภาพ</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 8 }}>
        {MOODS.map((m) => (
          <div
            key={m.id}
            className={`mood-card ${selectedMood === m.id ? "selected" : ""}`}
            style={{ borderRadius: 10, padding: "12px", background: "#0a0f1a" }}
            onClick={() => onChange(m.id)}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{m.emoji}</div>
            <div style={{
              fontSize: 13, fontWeight: 600, marginBottom: 3,
              color: selectedMood === m.id ? m.color : "#cbd5e1",
            }}>{m.label}</div>
            <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.4 }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
