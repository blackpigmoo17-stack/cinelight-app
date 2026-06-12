function buildExportHTML(analysis, diagramImgData) {
  const lights = (analysis.light_placement_detail || [])
    .map((l) => {
      const items = [
        l.equipment_to_use ? `<div class="item"><div class="label">อุปกรณ์</div><div class="value">${l.equipment_to_use}</div></div>` : "",
        l.distance ? `<div class="item"><div class="label">ระยะห่าง</div><div class="value">${l.distance}</div></div>` : "",
        l.angle_deg !== undefined ? `<div class="item"><div class="label">มุม</div><div class="value">${l.angle_deg}°</div></div>` : "",
        l.stand_height ? `<div class="item"><div class="label">ความสูง</div><div class="value">${l.stand_height}</div></div>` : "",
        l.modifier ? `<div class="item"><div class="label">Modifier</div><div class="value">${l.modifier}</div></div>` : "",
      ].join("");
      return `<div class="light"><div class="light-name">💡 ${l.light_name}</div><div class="grid">${items}</div></div>`;
    })
    .join("");

  const dateStr = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

  return `<html><head><title>CineLight AI</title><style>
    body{font-family:-apple-system,sans-serif;background:#fff;color:#111;padding:24px;max-width:800px;margin:0 auto}
    h1{font-size:20px;margin-bottom:4px}h2{font-size:13px;color:#666;font-weight:normal;margin-bottom:24px}
    img{width:100%;max-width:500px;display:block;margin:0 auto 24px}
    .section{margin-bottom:16px;padding:12px;border:1px solid #eee;border-radius:8px}
    .label{font-size:10px;color:#888;letter-spacing:1px;margin-bottom:4px;text-transform:uppercase}
    .value{font-size:13px;color:#111;line-height:1.6}
    .light{margin-bottom:12px;padding:10px;background:#f8f8f8;border-radius:6px}
    .light-name{font-weight:700;font-size:14px;margin-bottom:6px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .item{background:#fff;border:1px solid #eee;border-radius:4px;padding:6px 8px}
    @media print{body{padding:12px}}
  </style></head><body>
    <h1>🎬 CineLight AI — Lighting Plan</h1>
    <h2>${dateStr}</h2>
    ${diagramImgData ? `<img src="${diagramImgData}" />` : ""}
    <div class="section"><div class="label">วิเคราะห์ฉาก</div><div class="value">${analysis.scene_analysis || ""}</div></div>
    <div class="section"><div class="label">แนะนำการจัดแสง</div><div class="value">${analysis.lighting_recommendation || ""}</div></div>
    ${lights}
    ${analysis.key_challenge ? `<div class="section"><div class="label">⚠️ ความท้าทาย</div><div class="value">${analysis.key_challenge}</div></div>` : ""}
    ${analysis.pro_tip ? `<div class="section"><div class="label">🎥 Pro Tip</div><div class="value">${analysis.pro_tip}</div></div>` : ""}
    ${analysis.budget_tip ? `<div class="section"><div class="label">💰 ประหยัดงบ</div><div class="value">${analysis.budget_tip}</div></div>` : ""}
    <script>window.onload=function(){window.print()}<\/script>
  </body></html>`;
}

export default function ExportButton({ analysis }) {
  if (!analysis) return null;

  const handleExport = () => {
    const canvas = document.querySelector("canvas");
    const imgData = canvas ? canvas.toDataURL("image/png") : "";
    const html = buildExportHTML(analysis, imgData);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  };

  return (
    <button
      onClick={handleExport}
      style={{
        width: "100%", padding: "12px", marginTop: 16,
        background: "linear-gradient(135deg, #1e3a5f, #2d5a8f)",
        border: "1px solid #2a5a8f", borderRadius: 8,
        color: "#60a5fa", fontSize: 13, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit",
      }}
    >
      📄 Export PDF / Print
    </button>
  );
}
