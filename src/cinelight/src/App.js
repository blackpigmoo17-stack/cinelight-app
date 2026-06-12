import { useState } from "react";
import { MOODS } from "./constants/moods";
import { SHOT_TYPES } from "./constants/shotTypes";
import { LIGHTING_PRESETS } from "./constants/presets";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useCamera } from "./hooks/useCamera";
import { useAnalysis } from "./hooks/useAnalysis";
import Header from "./components/Header";
import CameraOverlay from "./components/CameraOverlay";
import ApiKeyModal from "./components/ApiKeyModal";
import StepUpload from "./components/StepUpload";
import { StepShot, StepMood } from "./components/StepControls";
import LightingPreset from "./components/LightingPreset";
import AnalysisResult from "./components/AnalysisResult";
import ExportButton from "./components/ExportButton";
import EquipmentSelector from "./EquipmentSelector";


const GLOBAL_STYLES = `
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
`;

export default function App() {
  const [step, setStep] = useState(1);
  const [showApiModal, setShowApiModal] = useState(false);
  const [sceneDescription, setSceneDescription] = useState("");

  const [apiKey, setApiKey] = useLocalStorage("cinelight_apikey", "");
  const [selectedMood, setSelectedMood] = useLocalStorage("cinelight_mood", null);
  const [selectedShot, setSelectedShot] = useLocalStorage("cinelight_shot", SHOT_TYPES[0]);
  const [imageBase64, setImageBase64] = useLocalStorage("cinelight_image", null);
  const [uploadedImage, setUploadedImage] = useLocalStorage("cinelight_image_preview", null);
  const [selectedEquipment, setSelectedEquipment] = useLocalStorage("cinelight_equipment", {});

  const { analysis, loading, analyze, reset } = useAnalysis();

  const handleCapture = (previewUrl, base64) => {
    setUploadedImage(previewUrl);
    setImageBase64(base64);
    setStep(2);
  };

  const camera = useCamera({ onCapture: handleCapture });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedImage(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.onload = (ev) => setImageBase64(ev.target.result.split(",")[1]);
    reader.readAsDataURL(file);
    setStep(2);
  };

  const handleMoodChange = (moodId) => {
    setSelectedMood(moodId);
    setStep(Math.max(step, 3));
    reset();
  };

  const handleAnalyze = () => {
    setStep(4);
    analyze({ imageBase64, mood: selectedMood, shotType: selectedShot, equipment: selectedEquipment, sceneDescription });
  };

  const preset = selectedMood ? LIGHTING_PRESETS[selectedMood] : null;
  const mood = selectedMood ? MOODS.find((m) => m.id === selectedMood) : null;
  const stepOpacity = (minStep) => ({ opacity: step >= minStep ? 1 : 0.35, transition: "opacity 0.3s", pointerEvents: step >= minStep ? "auto" : "none" });

  return (
    <div style={{ fontFamily: "'DM Sans','Noto Sans Thai',sans-serif", background: "#080c14", minHeight: "100vh", color: "#e2e8f0" }}>
      <style>{GLOBAL_STYLES}</style>

      {camera.cameraMode && (
        <CameraOverlay videoRef={camera.videoRef} onCapture={camera.capturePhoto} onClose={camera.stopCamera} />
      )}
      {showApiModal && (
        <ApiKeyModal
          apiKey={apiKey}
          onSave={(key) => { setApiKey(key); setShowApiModal(false); }}
          onClose={() => setShowApiModal(false)}
        />
      )}

      <Header step={step} apiKey={apiKey} onOpenApiModal={() => setShowApiModal(true)} />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
        <StepUpload
          uploadedImage={uploadedImage}
          sceneDescription={sceneDescription}
          cameraError={camera.cameraError}
          onOpenCamera={camera.openCamera}
          onFileUpload={handleFileUpload}
          onDescriptionChange={setSceneDescription}
        />

        <div style={stepOpacity(2)}>
          <StepShot selectedShot={selectedShot} onChange={setSelectedShot} />
          <EquipmentSelector equipment={selectedEquipment} onChange={setSelectedEquipment} />
          <StepMood selectedMood={selectedMood} onChange={handleMoodChange} />
        </div>

        {preset && mood && (
          <LightingPreset preset={preset} mood={mood} analysis={analysis} imageBase64={imageBase64} />
        )}

        {selectedMood && uploadedImage && (
          <div style={{ marginBottom: 24 }}>
            <div className="section-title">STEP 4 — วิเคราะห์ฉากด้วย AI</div>
            <button className="analyze-btn" disabled={loading} onClick={handleAnalyze} style={{ marginBottom: 16 }}>
              {loading ? <span className="pulse">🔍 กำลังวิเคราะห์ภาพ...</span> : "🎬 วิเคราะห์ฉากและแนะนำการวางไฟ"}
            </button>
            <AnalysisResult analysis={analysis} />
            <ExportButton analysis={analysis} />
          </div>
        )}

        <div style={{ textAlign: "center", fontSize: 10, color: "#1e293b", paddingTop: 16, borderTop: "1px solid #0f1929" }}>
          CINELIGHT AI · PROFESSIONAL LIGHTING DESIGNER · FOR PHOTOGRAPHERS & CINEMATOGRAPHERS
        </div>
      </div>
    </div>
  );
}
