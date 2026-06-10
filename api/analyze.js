module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { imageBase64, mood, shotType, equipment, sceneDescription } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "API Key not configured" });
  if (!imageBase64) return res.status(400).json({ error: "กรุณาอัปโหลดภาพ" });

  const equipmentLabels = {
    led_cob: "LED COB", led_panel: "LED Panel", tube_light: "Tube Light",
    hmi: "HMI/Fresnel", softbox: "Softbox/Modifier", stand: "ขาตั้ง/Boom Arm",
    gobo: "โกโบ้/Flag", other: "อื่นๆ"
  };

  const equipmentText = equipment && typeof equipment === "object"
    ? Object.entries(equipment)
        .filter(([_, items]) => Array.isArray(items) && items.length > 0)
        .flatMap(([catId, items]) =>
          items.filter(i => i.model?.trim()).map(i => `- ${equipmentLabels[catId] || catId}: ${i.model} จำนวน ${i.qty} ดวง/ชิ้น`)
        ).join("\n") || "ไม่ได้ระบุอุปกรณ์"
    : "ไม่ได้ระบุอุปกรณ์";

  const prompt = `คุณคือผู้กำกับแสงระดับ Hollywood ที่มีประสบการณ์มากกว่า 20 ปี เชี่ยวชาญทั้ง narrative film, commercial, และ music video

วิเคราะห์ภาพนี้อย่างละเอียดและออกแบบการจัดแสงแบบ ${mood} สำหรับช็อตประเภท: ${shotType}
คำอธิบายฉากจากผู้กำกับ: ${sceneDescription || "ไม่ได้ระบุ"}

อ้างอิงสไตล์ของ John Higgins, Cory Geryak, Dan Cornwall, Roger Deakins

อุปกรณ์ที่ผู้ใช้มี:
${equipmentText}

กฎสำคัญ:
- วิเคราะห์สภาพแวดล้อมจริงในภาพอย่างละเอียด
- หาจุดซ่อนไฟที่สร้างสรรค์ในฉาก
- แนะนำการ bounce แสงจากพื้นผิวที่มีในฉาก
- ใช้เฉพาะอุปกรณ์ที่ผู้ใช้มีเท่านั้น
- angle_deg: 0=ตรงหน้ากล้อง, -45=ซ้ายหน้า, 45=ขวาหน้า, -90=ซ้ายข้าง, 90=ขวาข้าง, -135=ซ้ายหลัง, 135=ขวาหลัง, 180=ด้านหลัง
- position ของ subject: center, left, right, front-left, front-right, back-left, back-right
ตอบสั้นกระชับ ไม่เกิน 1500 tokens รวมทั้งหมด

ตอบเป็น JSON เท่านั้น ไม่มี markdown ไม่มีข้อความนอก JSON:
{"scene_analysis":"วิเคราะห์ฉาก","environment":{"room_type":"ประเภทห้อง","natural_light":"แสงธรรมชาติ","surfaces":"พื้นผิว bounce","furniture":"เฟอร์นิเจอร์","hide_spots":"จุดซ่อนไฟ"},"lighting_recommendation":"แนะนำการจัดแสง","subjects":[{"id":1,"label":"นักแสดง 1","position":"center"}],"light_placement_detail":[{"light_name":"Key Light","equipment_to_use":"ระบุรุ่น","distance":"2 เมตร","angle_deg":-45,"stand_height":"2 เมตร","stand_type":"ขาตั้ง","modifier":"softbox","hide_tip":"วิธีซ่อนไฟ","target_subject_id":1}],"creative_opportunities":"โอกาสพิเศษ","key_challenge":"ความท้าทาย","pro_tip":"เคล็ดลับ","budget_tip":"ประหยัด"}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
       max_tokens: 2000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 }},
            { type: "text", text: prompt }
          ]
        }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || data.error);
    const text = data.content[0].text;
    let clean = text.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("ไม่พบ JSON ในคำตอบ");
    clean = jsonMatch[0];
    try {
      res.status(200).json(JSON.parse(clean));
    } catch (parseErr) {
      res.status(200).json({
        scene_analysis: "เกิดข้อผิดพลาดในการแปลง JSON กรุณาลองใหม่",
        lighting_recommendation: "",
        light_placement_detail: [],
        subjects: [{ id: 1, label: "Subject", position: "center" }],
        creative_opportunities: "",
        key_challenge: "",
        pro_tip: "",
        budget_tip: ""
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};