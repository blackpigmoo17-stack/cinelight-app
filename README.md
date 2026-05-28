# 🎬 CineLight AI — Professional Lighting Designer

App ออกแบบแสงสำหรับช่างภาพและ Cinematographer โดย AI

## ✨ ฟีเจอร์
- 📷 เปิดกล้องโทรศัพท์โดยตรง (กล้องหลัง)
- 🎭 เลือกอารมณ์ภาพ 10 สไตล์ (Film Noir, Cinematic Blue, Horror, ฯลฯ)
- 💡 แนะนำการวางไฟ ตำแหน่ง อุณหภูมิแสง
- 📸 คำนวณค่า f-stop, ISO, Shutter Speed
- 🤖 AI วิเคราะห์ฉากจากภาพจริง

---

## 🚀 วิธี Deploy (เลือกวิธีใดวิธีหนึ่ง)

### วิธีที่ 1: Vercel (แนะนำ — ง่ายที่สุด ฟรี)
1. สมัคร [vercel.com](https://vercel.com) (ใช้ GitHub login ได้)
2. อัปโหลดโฟลเดอร์ `cinelight` ขึ้น GitHub
3. กด "Import Project" บน Vercel → เลือก repo → Deploy
4. ได้ URL พร้อมใช้บนมือถือทันที ✅

### วิธีที่ 2: รันบนเครื่องตัวเอง (Local)
```bash
# ติดตั้ง Node.js ก่อน (nodejs.org)
cd cinelight
npm install
npm start
```
เปิดบนมือถือ: `http://[IP เครื่อง]:3000`  
หา IP: Windows → `ipconfig` | Mac/Linux → `ifconfig`

### วิธีที่ 3: Netlify (ฟรี)
```bash
cd cinelight
npm install
npm run build
```
ลาก folder `build/` ไปวางที่ [app.netlify.com/drop](https://app.netlify.com/drop) → เสร็จ!

---

## 🔑 การตั้งค่า API Key

เมื่อเปิด app ครั้งแรก:
1. กดปุ่ม **"🔑 ตั้งค่า API"** มุมบนขวา
2. ใส่ Anthropic API Key (สร้างได้ที่ [console.anthropic.com](https://console.anthropic.com))
3. กด **"บันทึก"** — Key จะถูกเก็บใน localStorage ของเบราว์เซอร์

---

## 📱 วิธีใช้งาน

1. **กด "เปิดกล้อง"** → ยกโทรศัพท์จัดเฟรมที่ต้องการ → กด 📸
2. **เลือกประเภทช็อต** (Portrait, Medium Shot, ฯลฯ)
3. **เลือกอารมณ์ภาพ** ที่ต้องการ
4. ดู **Lighting Setup** ที่แนะนำ (ไฟกี่ดวง วางไหน อุณหภูมิเท่าไหร่)
5. กด **"วิเคราะห์ฉากด้วย AI"** เพื่อให้ AI วิเคราะห์ภาพจริง

---

## 🛠 Tech Stack
- React 18
- Anthropic Claude API (claude-opus-4-5)
- getUserMedia API (กล้อง)
- CSS-in-JS
