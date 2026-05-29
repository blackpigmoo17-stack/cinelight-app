export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  
  const { imageBase64, mood, shotType, apiKey, equipment } = req.body;
  
  if (!apiKey) return res.status(400).json({ error: "กรุณาใส่ API Key" });
  if (!imageBase64) return res.status(400).json({ error: "กรุณาอัปโหลดภาพ" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 }},
            { type: "text", text: `วิเคราะห์ภาพนี้สำหรับการจัดแสงแบบ ${mood} ประเภทช็อต: ${shotType} อุปกรณ์ที่มี: ${JSON.stringify(equipment)} ตอบเป็น JSON: {"scene_analysis":"...","lighting_recommendation":"...","light_placement_detail":[{"light_name":"...","equipment_to_use":"...","distance":"...","angle":"...","stand_height":"...","stand_type":"...","modifier":"..."}],"key_challenge":"...","pro_tip":"...","budget_tip":"..."}` }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(clean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}