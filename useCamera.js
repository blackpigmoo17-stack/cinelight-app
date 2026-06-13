export const LIGHTING_PRESETS = {
  golden_hour: {
    lights: [
      { name: "Key Light (Warm)", pos: "45° ด้านขวาบน หน้าซับเจกต์", temp: "3200K", power: "80%", type: "Fresnel / HMI ติดเจล CTO", icon: "☀️" },
      { name: "Fill Light", pos: "ด้านตรงข้าม Key ระยะ 2x ไกลกว่า", temp: "4000K", power: "30%", type: "Softbox ขนาดกลาง", icon: "🔆" },
      { name: "Rim / Hair Light", pos: "ด้านหลัง 135° ชี้มาหาซับเจกต์", temp: "3500K", power: "50%", type: "Fresnel เล็ก / LED strip", icon: "✨" },
    ],
    fStop: "f/1.8 – f/2.8", iso: "ISO 100–400", shutter: "1/100 – 1/500",
    tips: "ใช้ reflector สีทอง bounce แสงธรรมชาติ หรือ HMI ที่ window เพื่อเลียนแบบ golden hour", ratio: "3:1",
  },
  noir: {
    lights: [
      { name: "Hard Key Light", pos: "90° ด้านข้างโดยตรง ระดับสูง", temp: "5600K", power: "100%", type: "Fresnel แข็ง / PAR can ไม่มี diffusion", icon: "💡" },
      { name: "Practical Light", pos: "Background เช่น โคมไฟตั้งโต๊ะ", temp: "2700K", power: "60%", type: "Bare Bulb / Edison", icon: "🕯️" },
    ],
    fStop: "f/2.8 – f/5.6", iso: "ISO 400–1600", shutter: "1/60 – 1/200",
    tips: "ไม่ต้องใช้ fill light — เงาหนักคือเป้าหมาย ใช้ flag/cutter กั้นแสงไม่ให้ล้นเกิน", ratio: "8:1",
  },
  cinematic_blue: {
    lights: [
      { name: "Key Light (Cool)", pos: "30° ด้านหน้าบน", temp: "6500K", power: "70%", type: "LED Panel ติดเจล CTB", icon: "🔵" },
      { name: "Fill Light", pos: "ตรงข้าม Key Light", temp: "6000K", power: "25%", type: "Bounce card / LED อ่อน", icon: "💙" },
      { name: "Background Light", pos: "ส่องไปที่ฉากหลัง", temp: "7000K", power: "40%", type: "LED wash / Kino Flo", icon: "🌙" },
      { name: "Rim Light", pos: "ด้านหลัง 120°", temp: "6500K", power: "60%", type: "LED strip / Fresnel", icon: "⚡" },
    ],
    fStop: "f/2.0 – f/4.0", iso: "ISO 200–800", shutter: "1/125 – 1/500",
    tips: "ใช้ LUT Teal & Orange ใน post เพื่อเสริมความ cinematic เพิ่ม haze/fog machine เบาๆ", ratio: "4:1",
  },
  soft_beauty: {
    lights: [
      { name: "Beauty Dish / Large Softbox", pos: "ตรงหน้า ระดับเดียวกับหน้า", temp: "5600K", power: "60%", type: "Beauty Dish White / Octabox 150cm", icon: "🌸" },
      { name: "Fill Light", pos: "ต่ำกว่าหน้าเล็กน้อย ด้านหน้า", temp: "5600K", power: "40%", type: "Reflector ขาว / LED panel", icon: "🔆" },
      { name: "Hair Light", pos: "ด้านบนหลัง", temp: "5600K", power: "30%", type: "Small softbox / strip box", icon: "✨" },
      { name: "Background Light", pos: "ส่องไปที่ฉาก", temp: "6000K", power: "20%", type: "LED wash สีขาว", icon: "☁️" },
    ],
    fStop: "f/1.4 – f/2.8", iso: "ISO 100–200", shutter: "1/200 – 1/500",
    tips: "ใช้ diffusion เพิ่ม เช่น Silk / Frost gel หน้ากล้อง ตั้ง white balance อยู่ที่ 5500K", ratio: "2:1",
  },
  horror: {
    lights: [
      { name: "Under Light (Monster Light)", pos: "ต่ำกว่าซับเจกต์ ชี้ขึ้น", temp: "3200K", power: "80%", type: "Fresnel แข็ง / Par can", icon: "🩸" },
      { name: "Practical Red/Green", pos: "Background หรือ prop", temp: "< 3000K", power: "50%", type: "ใส่เจลสีแดง/เขียว", icon: "🔴" },
    ],
    fStop: "f/2.8 – f/5.6", iso: "ISO 800–3200", shutter: "1/60 – 1/125",
    tips: "grain สูง, contrast สูง, ใช้ practical light เป็น key เพื่อ motivation ดูสมจริง", ratio: "10:1",
  },
  documentary: {
    lights: [
      { name: "Natural Key Light", pos: "หน้าต่าง / ประตู ด้านใดด้านหนึ่ง", temp: "5600K", power: "ธรรมชาติ", type: "ไม่ใช้ไฟเพิ่ม / Bounce แสงธรรมชาติ", icon: "🌤️" },
      { name: "Fill Light (Optional)", pos: "ตรงข้ามหน้าต่าง", temp: "5600K", power: "20%", type: "Reflector ขาว / LED panel เบา", icon: "📋" },
    ],
    fStop: "f/2.8 – f/5.6", iso: "ISO 400–3200", shutter: "1/60 – 1/250",
    tips: "อย่าทำให้ดูตั้งใจเกินไป ใช้แสงจริงเป็นหลัก เปิด Auto WB หรือ lock ที่สภาพแวดล้อม", ratio: "2:1",
  },
  scifi: {
    lights: [
      { name: "Neon Accent (Cyan)", pos: "ด้านข้างซ้าย ระดับกลาง", temp: "6500K + CTB", power: "70%", type: "LED RGB strip / Tube light สีฟ้า", icon: "🤖" },
      { name: "Neon Accent (Purple)", pos: "ด้านข้างขวา", temp: "6500K + Purple gel", power: "50%", type: "LED RGB strip / Tube light สีม่วง", icon: "🔮" },
      { name: "Key Light (Cool)", pos: "30° ด้านหน้าบน", temp: "6500K", power: "60%", type: "LED Panel", icon: "💡" },
      { name: "Rim Light", pos: "ด้านหลัง", temp: "5600K", power: "80%", type: "Fresnel เล็ก", icon: "⚡" },
    ],
    fStop: "f/2.0 – f/4.0", iso: "ISO 200–800", shutter: "1/125 – 1/500",
    tips: "ใช้ haze machine เพิ่ม atmospheric effect เพื่อให้แสง RGB visible ใน air", ratio: "4:1",
  },
  romance: {
    lights: [
      { name: "Soft Key Light", pos: "45° ด้านหน้า ระดับสูงกว่าหน้าเล็กน้อย", temp: "3800K", power: "60%", type: "Large Octabox / Umbrella ขาว", icon: "💜" },
      { name: "Fill Light", pos: "ตรงข้าม Key", temp: "4000K", power: "35%", type: "Reflector / LED panel อ่อน", icon: "🌟" },
      { name: "Rim / Kicker", pos: "ด้านหลัง 135°", temp: "3500K", power: "40%", type: "Small softbox / LED", icon: "✨" },
      { name: "Practical Candle/Fairy lights", pos: "Background / foreground prop", temp: "2700K", power: "natural", type: "Practical light จริง", icon: "🕯️" },
    ],
    fStop: "f/1.4 – f/2.0", iso: "ISO 100–400", shutter: "1/100 – 1/400",
    tips: "ใช้ diffusion มากเป็นพิเศษ เช่น Black Pro-Mist filter หน้ากล้องเพื่อ glow effect นุ่มๆ", ratio: "3:1",
  },
  commercial: {
    lights: [
      { name: "Key Light (Main)", pos: "ตรงหน้า หรือ 30° ด้านข้าง", temp: "5600K", power: "100%", type: "Large softbox / Strip box", icon: "✨" },
      { name: "Fill Light", pos: "ตรงข้าม Key", temp: "5600K", power: "70%", type: "Softbox / Reflector ขาว", icon: "🔆" },
      { name: "Background Light", pos: "ส่องฉากหลังขาว/เทา", temp: "5600K", power: "80%", type: "LED wash x2 (ซ้าย-ขวา)", icon: "📸" },
    ],
    fStop: "f/5.6 – f/11", iso: "ISO 100", shutter: "1/200 – 1/500",
    tips: "Ratio ต่ำที่สุด ต้องการความ even สม่ำเสมอ เหมาะกับ product shot และ beauty", ratio: "1.5:1",
  },
  music_video: {
    lights: [
      { name: "Moving Head / Spot", pos: "บนเพดาน หลายจุด", temp: "Variable", power: "100%", type: "Moving head RGB / Strobe", icon: "🎵" },
      { name: "LED RGB Wall", pos: "ฉากหลัง", temp: "RGB Variable", power: "80%", type: "LED panel wall", icon: "🌈" },
      { name: "Key Light", pos: "45° ด้านหน้า", temp: "5600K", power: "70%", type: "LED Panel / Fresnel", icon: "💡" },
      { name: "Haze Machine", pos: "ทั่วพื้นที่", temp: "-", power: "-", type: "Haze / Fog Machine", icon: "🌫️" },
    ],
    fStop: "f/2.0 – f/4.0", iso: "ISO 400–1600", shutter: "1/60 – 1/125",
    tips: "Shutter ต่ำเพื่อรับแสง strobe ได้ ใช้ high frame rate (120fps) สำหรับ slow motion", ratio: "Variable",
  },
};
