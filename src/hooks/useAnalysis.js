import { useState } from "react";

async function analyzeImageMood(imageBase64, mood, shotType, equipment = [], sceneDescription = "") {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, mood, shotType, equipment, sceneDescription }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export function useAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async ({ imageBase64, mood, shotType, equipment, sceneDescription }) => {
    if (!mood || !imageBase64) return;
    setLoading(true);
    try {
      const result = await analyzeImageMood(imageBase64, mood, shotType, equipment, sceneDescription);
      setAnalysis(result);
    } catch (err) {
      setAnalysis({
        scene_analysis: `เกิดข้อผิดพลาด: ${err.message}`,
        lighting_recommendation: "",
        key_challenge: "",
        pro_tip: "",
      });
    }
    setLoading(false);
  };

  const reset = () => setAnalysis(null);

  return { analysis, loading, analyze, reset };
}
