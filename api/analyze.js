module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { imageBase64, mood, shotType, equipment, sceneDescription } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "API Key not configured" });
  if (!imageBase64) return res.status(400).json({ error: "กรุณาอัปโหลดภาพ" });

  // แปลง equipment object เป็นข้อความที่ AI อ่านง่าย
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

  const prompt = `คุณคือผู้เชี่ยวชาญด้านการจัดแสงระดับ Hollywood

วิเคราะห์ภาพนี้และออกแบบการจัดแสงแบบ ${mood} สำหรับช็อตประเภท: ${shotType}คำอธิบายฉากจากผู้กำกับ: ${sceneDescription || "ไม่ได้ระบุ"}

อ้างอิงสไตล์การจัดแสงของ John Higgins, Cory Geryak, Dan Cornwall — วางแผนแสงแบบมืออาชีพระดับ Hollywood

อุปกรณ์ที่ผู้ใช้มี:
${equipmentText}

กฎสำคัญ:
- ใช้เฉพาะอุปกรณ์ที่ผู้ใช้มีเท่านั้น ระบุชื่อรุ่นให้ตรงกับที่กรอกมา
- ถ้าไม่มีอุปกรณ์เพียงพอ ให้แนะนำวิธีประยุกต์ใช้สิ่งที่มี
- ออกแบบตามหลัก 3-point lighting หรือสูงกว่าตามความเหมาะสม
- ระบุตำแหน่ง มุม ระยะห่าง และ modifier ที่ใช้กับอุปกรณ์แต่ละชิ้น

ตอบเป็นภาษาไทยทั้งหมด ตอบเป็น JSON เท่านั้น ไม่มี markdown:
{"scene_analysis":"วิเคราะห์ฉาก แสง สภาพแวดล้อม","lighting_recommendation":"แนะนำการจัดแสงโดยรวมโดยใช้อุปกรณ์ที่มี","light_placement_detail":[{"light_name":"ชื่อไฟ เช่น Key Light","equipment_to_use":"ระบุรุ่นอุปกรณ์จากที่ผู้ใช้มี","distance":"ระยะห่างจาก subject","angle":"มุมองศา","stand_height":"ความสูงขาตั้ง","stand_type":"ประเภทขาตั้งที่ใช้","modifier":"modifier ที่ใช้"}],"key_challenge":"ความท้าทายหลักของฉากนี้","pro_tip":"เคล็ดลับระดับมืออาชีพ","budget_tip":"วิธีประหยัดหรือประยุกต์ใช้อุปกรณ์ที่มี"}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
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
    const clean = text.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(clean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};