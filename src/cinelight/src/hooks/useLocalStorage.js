import { useState, useEffect } from "react";

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return defaultValue;
      // พยายาม parse JSON ก่อน ถ้าไม่ได้ return raw string
      try { return JSON.parse(stored); } catch { return stored; }
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
      }
    } catch {}
  }, [key, value]);

  return [value, setValue];
}
