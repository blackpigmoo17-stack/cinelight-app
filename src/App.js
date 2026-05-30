import { useState, useRef, useCallback } from "react";
import LightingDiagram3D from "./LightingDiagram3D";
import EquipmentSelector from "./EquipmentSelector";

const MOODS = [
  { id: "golden_hour", label: "Golden Hour", emoji: "🌅", desc: "อบอุ่น นุ่มนวล โรแมนติก", color: "#f59e0b" },
  { id: "noir", label: "Film Noir", emoji: "🎭", desc: "ลึกลับ ดราม่า เงาหนัก", color: "#6366f1" },
  { id: "cinematic_blue", label: "Cinematic Blue", emoji: "🌃", desc: "เย็น สง่า มีพลัง", color: "#3b82f6" },
  { id: "soft_beauty", label: "Soft Beauty", emoji: "🌸", desc: "อ่อนโยน สว่าง แฟชั่น", color: "#f472b6" },
  { id: "horror", label: "Horror / Thriller", emoji: "🩸", desc: "ตึงเครียด น่ากลัว มืด", color: "#ef4444" },
  { id: "documentary", label: "Documentary", emoji: "📽️", desc: "ธรรมชาติ จริง ไม่ตกแต่ง", color: "#84cc16" },
  { id: "scifi", label: "Sci-Fi / Cyber", emoji: "🤖", desc: "อนาคต เย็นยะเยือก นีออน", color: "#06b6d4" },
  { id: "romance", label: "Romance / Drama", emoji: "💫", desc: "อ่อนหวาน ฝัน อารมณ์ลึก", color: "#a78bfa" },
  { id: "commercial", label: "Commercial / Ad", emoji: "✨", desc: "สว่าง สะอาด ขายของ", color: "#e2e8f0" },
  { id: "music_video", label: "Music Video", emoji: "🎵", desc: "พลังงาน แฟลช หลากสี", color: "#f97316" },
];

const SHOT_TYPES = ["Portrait / ใกล้หน้า", "Medium Shot / ครึ่งตัว", "Full Body / เต็มตัว", "Wide Scene / ฉากกว้าง", "Product / สินค้า", "Interview / สัมภาษณ์"];

const LIGHTING_PRESETS = {
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


 const analyzeImageMood = async (imageBase64, mood, shotType, equipment = []) => {
  const selectedMood = MOODS.find(m => m.id === mood);
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        imageBase64,
        mood,
        shotType,
        equipment
      })
    });
  const data = await response.json();
if (data.error) throw new Error(data.error);
return data;
  } catch (err) {
    throw err;
  }
};

export default function App() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedShot, setSelectedShot] = useState(SHOT_TYPES[0]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [cameraMode, setCameraMode] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem("cinelight_apikey") || "");
  const [showApiInput, setShowApiInput] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState({});
  const fileRef = useRef();
  const videoRef = useRef();
  const streamRef = useRef();

  const openCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      setCameraMode(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch (err) {
      setCameraError("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาต permission กล้องในเบราว์เซอร์");
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setUploadedImage(dataUrl);
    setImageBase64(dataUrl.split(",")[1]);
    stopCamera();
    setStep(2);
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraMode(false);
  }, []);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    const reader = new FileReader();
    reader.onload = (ev) => setImageBase64(ev.target.result.split(",")[1]);
    reader.readAsDataURL(file);
    setStep(2);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedMood || !imageBase64) return;
    if (!apiKey) { setShowApiInput(true); return; }
    setLoading(true);
    setStep(4);
    try {
      const result = await analyzeImageMood(imageBase64, selectedMood, selectedShot, apiKey, selectedEquipment);
      setAnalysis(result);
    } catch (err) {
      setAnalysis({ scene_analysis: `เกิดข้อผิดพลาด: ${err.message}`, lighting_recommendation: "", key_challenge: "", pro_tip: "" });
    }
    setLoading(false);
  };

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem("cinelight_apikey", key);
    setShowApiInput(false);
  };

  const preset = selectedMood ? LIGHTING_PRESETS[selectedMood] : null;
  const mood = selectedMood ? MOODS.find(m => m.id === selectedMood) : null;

  return (
    <div style={{ fontFamily: "'DM Sans','Noto Sans Thai',sans-serif", background: "#080c14", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&family=Noto+Sans+Thai:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0d1117}::-webkit-scrollbar-thumb{background:#334155;border-radius:2px}
        .mood-card{transition:all 0.2s ease;border:1px solid #1e293b;cursor:pointer}
        .mood-card:hover{transform:translateY(-2px);border-color:#334155}
        .mood-card.selected{border-color:#60a5fa!important;background:#0f172a!important}
        .light-card{background:#0d1117;border:1px solid #1e293b;border-radius:10px;padding:14px}
        .analyze-btn{background:linear-gradient(135deg,#3b82f6,#8b5cf6);border:none;color:white;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;transition:all 0.2s;width:100%}
        .analyze-btn:hover{opacity:0.9;transform:translateY(-1px)}
        .analyze-btn:disabled{opacity:0.4;cursor:not-allowed;transform:none}
        .tag{background:#1e293b;border-radius:4px;padding:3px 8px;font-size:11px;color:#94a3b8;font-family:'DM Mono',monospace}
        .section-title{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#475569;font-weight:600;margin-bottom:12px}
        .upload-zone{border:2px dashed #1e293b;border-radius:12px;padding:32px;text-align:center;cursor:pointer;transition:all 0.2s;background:#0a0f1a}
        .upload-zone:hover{border-color:#3b82f6;background:#0d1421}
        .shot-btn{background:#0d1117;border:1px solid #1e293b;border-radius:6px;padding:8px 14px;color:#94a3b8;font-size:12px;cursor:pointer;transition:all 0.15s;white-space:nowrap;font-family:inherit}
        .shot-btn:hover{border-color:#334155;color:#e2e8f0}
        .shot-btn.sel{border-color:#3b82f6;color:#60a5fa;background:#0f1e3d}
        .analysis-card{background:#0d1117;border:1px solid #1e293b;border-radius:12px;padding:16px;margin-bottom:10px}
        .pulse{animation:pulse 1.5s ease-in-out infinite}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .cam-btn{border:none;border-radius:8px;padding:12px 20px;font-size:14px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit}
        .step-num{width:24px;height:24px;border-radius:50%;background:#1e293b;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#64748b;flex-shrink:0}
        .step-num.active{background:#3b82f6;color:white}
        input[type=text],input[type=password]{background:#0d1117;border:1px solid #334155;border-radius:8px;padding:10px 14px;color:#e2e8f0;font-size:14px;width:100%;font-family:inherit}
        input[type=text]:focus,input[type=password]:focus{outline:none;border-color:#3b82f6}
      `}</style>

      {/* Camera Overlay */}
      {cameraMode && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "#000", zIndex: 9999,
          touchAction: "none", userSelect: "none",
          overflow: "hidden"
        }}>
          {/* Video - true fullscreen, no scroll */}
          <video ref={videoRef} autoPlay playsInline muted
            style={{
              position: "fixed", top: 0, left: 0,
              width: "100vw", height: "100vh",
              objectFit: "cover", zIndex: 1
            }} />

          {/* Cancel - fixed top left */}
          <button onClick={stopCamera} style={{
            position: "fixed", top: 24, left: 20, zIndex: 9999,
            background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: 30, padding: "10px 20px", color: "white",
            fontSize: 15, fontWeight: 700, cursor: "pointer"
          }}>✕</button>

          {/* Hint - fixed top right */}
          <div style={{
            position: "fixed", top: 24, right: 20, zIndex: 9999,
            background: "rgba(0,0,0,0.55)", borderRadius: 8,
            padding: "8px 12px", fontSize: 12, color: "rgba(255,255,255,0.8)"
          }}>จัดเฟรมแล้วกด ⭕</div>

          {/* Shutter - fixed bottom center, NEVER moves */}
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
            display: "flex", justifyContent: "center", alignItems: "center",
            paddingBottom: 40, paddingTop: 20,
            background: "linear-gradient(transparent, rgba(0,0,0,0.7))"
          }}>
            <button onClick={capturePhoto} style={{
              width: 84, height: 84, borderRadius: "50%",
              background: "transparent", border: "5px solid white",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", padding: 0, WebkitTapHighlightColor: "transparent"
            }}>
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: "white" }} />
            </button>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showApiInput && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>🔑 ใส่ Anthropic API Key</div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16, lineHeight: 1.6 }}>
              สร้าง API Key ได้ที่ <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: "#60a5fa" }}>console.anthropic.com</a><br />
              Key จะถูกเก็บไว้ใน localStorage บนเครื่องของคุณเท่านั้น
            </div>
            <input type="password" placeholder="sk-ant-..." defaultValue={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{ marginBottom: 12 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="cam-btn" style={{ background: "#1e293b", color: "#94a3b8", flex: 1 }} onClick={() => setShowApiInput(false)}>ยกเลิก</button>
              <button className="cam-btn" style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", color: "white", flex: 1 }} onClick={() => saveApiKey(apiKey)}>บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: "1px solid #0f1929", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, background: "#060a12", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎬</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.5px" }}>CineLight AI</div>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.5px" }}>PROFESSIONAL LIGHTING DESIGNER</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setShowApiInput(true)} style={{ background: "none", border: "1px solid #1e293b", borderRadius: 6, padding: "4px 10px", color: "#475569", fontSize: 11, cursor: "pointer" }}>
            {apiKey ? "🔑 API" : "🔑 ตั้งค่า API"}
          </button>
          {[1,2,3,4].map(n => <div key={n} className={`step-num ${step >= n ? "active" : ""}`}>{n}</div>)}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* Step 1 */}
        <div style={{ marginBottom: 28 }}>
          <div className="section-title">STEP 1 — ถ่ายหรืออัปโหลดเฟรม</div>
          {cameraError && <div style={{ background: "#1f0a0a", border: "1px solid #7f1d1d", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "#fca5a5" }}>{cameraError}</div>}
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <button className="cam-btn" style={{ flex: 1, background: "linear-gradient(135deg,#1e3a5f,#0f2040)", color: "#60a5fa", border: "1px solid #1e3a5f", fontSize: 15 }} onClick={openCamera}>
              📷 เปิดกล้อง
            </button>
            <button className="cam-btn" style={{ flex: 1, background: "#0d1117", color: "#94a3b8", border: "1px solid #1e293b", fontSize: 15 }} onClick={() => fileRef.current.click()}>
              🖼️ เลือกจากคลัง
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />
          {uploadedImage && (
            <div style={{ position: "relative", textAlign: "center" }}>
              <img src={uploadedImage} alt="frame" style={{ maxHeight: 220, maxWidth: "100%", borderRadius: 10, objectFit: "contain", border: "1px solid #1e293b" }} />
              <div style={{ marginTop: 6, fontSize: 12, color: "#60a5fa" }}>✓ โหลดภาพแล้ว — กดปุ่มด้านบนเพื่อถ่ายใหม่</div>
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div style={{ marginBottom: 28, opacity: step >= 2 ? 1 : 0.35, transition: "opacity 0.3s", pointerEvents: step >= 2 ? "auto" : "none" }}>
          <div className="section-title">STEP 2 — ประเภทช็อต</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SHOT_TYPES.map(s => (
              <button key={s} className={`shot-btn ${selectedShot === s ? "sel" : ""}`} onClick={() => setSelectedShot(s)}>{s}</button>
            ))}
          </div>
        </div>

        {/* Equipment Selector */}
        <div style={{ marginBottom: 28, opacity: step >= 2 ? 1 : 0.35, transition: "opacity 0.3s", pointerEvents: step >= 2 ? "auto" : "none" }}>
          <EquipmentSelector selected={selectedEquipment} onChange={setSelectedEquipment} />
        </div>

        {/* Step 3 */}
        <div style={{ marginBottom: 28, opacity: step >= 2 ? 1 : 0.35, transition: "opacity 0.3s", pointerEvents: step >= 2 ? "auto" : "none" }}>
          <div className="section-title">STEP 3 — เลือกอารมณ์ภาพ</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 8 }}>
            {MOODS.map(m => (
              <div key={m.id} className={`mood-card ${selectedMood === m.id ? "selected" : ""}`}
                style={{ borderRadius: 10, padding: "12px", background: "#0a0f1a" }}
                onClick={() => { setSelectedMood(m.id); setStep(Math.max(step, 3)); setAnalysis(null); }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{m.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: selectedMood === m.id ? m.color : "#cbd5e1", marginBottom: 3 }}>{m.label}</div>
                <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.4 }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Lighting Preset */}
        {preset && mood && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div className="section-title" style={{ margin: 0 }}>LIGHTING SETUP — {mood.label.toUpperCase()}</div>
              <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 6, padding: "6px 14px", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>RATIO</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: mood.color, fontFamily: "DM Mono" }}>{preset.ratio}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 10, marginBottom: 14 }}>
              {preset.lights.map((light, i) => (
                <div key={i} className="light-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{light.icon}</span>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{light.name}</div>
                    <span className="tag" style={{ marginLeft: "auto" }}>#{i + 1}</span>
                  </div>
                  {[["ตำแหน่ง", light.pos, "#94a3b8"], ["อุณหภูมิ", light.temp, mood.color], ["กำลัง", light.power, "#94a3b8"], ["ชนิดไฟ", light.type, "#64748b"]].map(([label, val, col]) => (
                    <div key={label} style={{ display: "flex", gap: 6, alignItems: "flex-start", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: "#475569", width: 50, flexShrink: 0 }}>{label}</span>
                      <span style={{ fontSize: 11, color: col, fontFamily: label === "อุณหภูมิ" ? "DM Mono" : "inherit", fontWeight: label === "อุณหภูมิ" ? 600 : 400 }}>{val}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <LightingDiagram3D lights={preset.lights} moodColor={mood.color} />
            <div style={{ background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 10, padding: "14px 18px", display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[["F-STOP", preset.fStop, "#60a5fa"], ["ISO", preset.iso, "#a78bfa"], ["SHUTTER", preset.shutter, "#34d399"]].map(([label, val, col]) => (
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
        )}

        {/* Step 4 */}
        {selectedMood && uploadedImage && (
          <div style={{ marginBottom: 24 }}>
            <div className="section-title">STEP 4 — วิเคราะห์ฉากด้วย AI</div>
            <button className="analyze-btn" disabled={loading} onClick={handleAnalyze} style={{ marginBottom: 16 }}>
              {loading ? <span className="pulse">🔍 กำลังวิเคราะห์ภาพ...</span> : "🎬 วิเคราะห์ฉากและแนะนำการวางไฟ"}
            </button>
            {analysis && (
              <div>
                {analysis.scene_analysis && (
                  <div className="analysis-card">
                    <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>📍 วิเคราะห์ฉาก</div>
                    <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>{analysis.scene_analysis}</div>
                  </div>
                )}
                {analysis.lighting_recommendation && (
                  <div className="analysis-card" style={{ borderColor: "#1e3a5f" }}>
                    <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>💡 คำแนะนำการวางไฟ</div>
                    <div style={{ fontSize: 13, color: "#93c5fd", lineHeight: 1.7 }}>{analysis.lighting_recommendation}</div>
                  </div>
                )}
                {analysis.light_placement_detail && analysis.light_placement_detail.length > 0 && (
                  <div className="analysis-card" style={{ borderColor: "#1a2d3a" }}>
                    <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 12 }}>🎯 รายละเอียดการวางไฟแต่ละดวง</div>
                    {analysis.light_placement_detail.map((l, i) => (
                      <div key={i} style={{ background: "#060a12", borderRadius: 8, padding: "12px", marginBottom: 10, border: "1px solid #1e293b" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", marginBottom: 8 }}>💡 {l.light_name}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          {[
                            ["🔧 อุปกรณ์", l.equipment_to_use],
                            ["📏 ระยะห่าง", l.distance],
                            ["🦺 ขาตั้ง", l.stand_type],
                            ["📐 มุมก้ม", l.angle],
                            ["↕️ ความสูง", l.stand_height],
                            ["✨ Modifier", l.modifier],
                          ].filter(([,v]) => v).map(([label, val]) => (
                            <div key={label} style={{ background: "#0a0f1a", borderRadius: 6, padding: "6px 8px" }}>
                              <div style={{ fontSize: 9, color: "#475569", marginBottom: 2 }}>{label}</div>
                              <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.4 }}>{val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {analysis.key_challenge && (
                  <div className="analysis-card" style={{ borderColor: "#3d1f1f" }}>
                    <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>⚠️ ความท้าทายที่ต้องระวัง</div>
                    <div style={{ fontSize: 13, color: "#fca5a5", lineHeight: 1.7 }}>{analysis.key_challenge}</div>
                  </div>
                )}
                {analysis.pro_tip && (
                  <div className="analysis-card" style={{ borderColor: "#1a2d1a" }}>
                    <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>🎥 Pro Tip จาก DOP</div>
                    <div style={{ fontSize: 13, color: "#86efac", lineHeight: 1.7 }}>{analysis.pro_tip}</div>
                  </div>
                )}
                {analysis.budget_tip && (
                  <div className="analysis-card" style={{ borderColor: "#2d2a1a" }}>
                    <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>💰 ประหยัดงบ</div>
                    <div style={{ fontSize: 13, color: "#fde68a", lineHeight: 1.7 }}>{analysis.budget_tip}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 10, color: "#1e293b", paddingTop: 16, borderTop: "1px solid #0f1929" }}>
          CINELIGHT AI · PROFESSIONAL LIGHTING DESIGNER · FOR PHOTOGRAPHERS & CINEMATOGRAPHERS
        </div>
      </div>
    </div>
  );
}
