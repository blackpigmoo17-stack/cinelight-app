import { useState, useRef, useCallback } from "react";

export function useCamera({ onCapture }) {
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef();
  const streamRef = useRef();

  const openCamera = useCallback(async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      setCameraMode(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      setCameraError("ไม่สามารถเปิดกล้องได้ กรุณาอนุญาต permission กล้องในเบราว์เซอร์");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraMode(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    onCapture(dataUrl, dataUrl.split(",")[1]);
    stopCamera();
  }, [onCapture, stopCamera]);

  return { cameraMode, cameraError, videoRef, openCamera, stopCamera, capturePhoto };
}
