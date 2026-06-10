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
- วิเคราะห์สภาพแวดล้อมจริงในภาพอย่างละเอียด: มุมห้อง ผนัง เพดาน หน้าต่าง ประตู เฟอร์นิเจอร์ ชั้นวาง พื้นผิว แสงธรรมชาติ
- หาจุดซ่อนไฟที่สร้างสรรค์: หลังเฟอร์นิเจอร์ ใต้ชั้นวาง มุมห้อง บนเพดาน ข้างประตู
- แนะนำการ bounce แสงจากพื้นผิวที่มีในฉาก เช่น ผนังขาว เพดาน โต๊ะ กระจก
- ใช้เฉพาะอุปกรณ์ที่ผู้ใช้มีเท่านั้น ถ้าไม่มีพอให้แนะนำวิธีประยุกต์ใช้
- คิดนอกกรอบ 3-point lighting พื้นฐาน หาวิธีที่ทำให้ภาพดูน่าทึ่ง
- angle_deg: 0=ตรงหน้ากล้อง, -45=ซ้ายหน้า, 45=ขวาหน้า, -90=ซ้ายข้าง, 90=ขวาข้าง, -135=ซ้ายหลัง, 135=ขวาหลัง, 180=ด้านหลัง
- position ของ subject: center, left, right, front-left, front-right, back-left, back-right

ตอบเป็นภาษาไทย ตอบเป็น JSON เท่านั้น ไม่มี markdown:
{"scene_analysis":"วิเคราะห์ฉากโดยละเอียด รวมถึงสภาพแวดล้อม แสงธรรมชาติ พื้นผิว และโอกาสพิเศษที่เห็นในภาพ","environment":{"room_type":"ประเภทห้อง/สถานที่","natural_light":"แสงธรรมชาติที่มี","surfaces":"พื้นผิวที่ bounce แสงได้","furniture":"เฟอร์นิเจอร์และสิ่งของสำคัญ","hide_spots":"จุดซ่อนไฟที่เห็นในฉาก"},"lighting_recommendation":"แนะนำการจัดแสงโดยรวมแบบ creative และ advanced","subjects":[{"id":1,"label":"นักแสดง 1","position":"center"}],"light_placement_detail":[{"light_name":"ชื่อไฟ","equipment_to_use":"ระบุรุ่นอุปกรณ์","distance":"ระยะห่าง","angle_deg":-45,"stand_height":"ความสูง","stand_type":"ประเภทขาตั้ง","modifier":"modifier","hide_tip":"วิธีซ่อนหรือ integrate ไฟในฉากให้ดูธรรมชาติ","target_subject_id":1}],"creative_opportunities":"โอกาสพิเศษที่เห็นในฉากนี้ เช่น bounce จากผนัง ซ่อนไฟหลังของ practical light","key_challenge":"ความท้าทายหลัก","pro_tip":"เคล็ดลับระดับมืออาชีพที่เฉพาะสำหรับฉากนี้","budget_tip":"วิธีประหยัดหรือประยุกต์ใช้อุปกรณ์ที่มี"}`;

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

   const text = data.content[0].text;
let clean = text.replace(/```json|```/g, "").trim();
// หา JSON object ที่อยู่ในข้อความ
const jsonMatch = clean.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error("ไม่พบ JSON ในคำตอบ");
clean = jsonMatch[0];
res.status(200).json(JSON.parse(clean));} catch (err) {
    res.status(500).json({ error: err.message });
  }
};