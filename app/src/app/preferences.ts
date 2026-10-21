import { useEffect, useState } from "react";
export type Preferences = {
  motion: "system" | "reduce";
  textSize: "standard" | "large";
  contrast: "standard" | "high";
};
export const defaultPreferences: Preferences = {
  motion: "system",
  textSize: "standard",
  contrast: "standard",
};
export function readPreferences(raw: string | null): Preferences {
  try {
    const value = JSON.parse(raw ?? "null");
    return {
      motion: value?.motion === "reduce" ? "reduce" : "system",
      textSize: value?.textSize === "large" ? "large" : "standard",
      contrast: value?.contrast === "high" ? "high" : "standard",
    };
  } catch {
    return { ...defaultPreferences };
  }
}
export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      return readPreferences(localStorage.getItem("maeen-preferences-v1"));
    } catch {
      return { ...defaultPreferences };
    }
  });
  useEffect(() => {
    document.documentElement.dataset.motion = preferences.motion;
    document.documentElement.dataset.textSize = preferences.textSize;
    document.documentElement.dataset.contrast = preferences.contrast;
    try {
      localStorage.setItem("maeen-preferences-v1", JSON.stringify(preferences));
    } catch {}
  }, [preferences]);
  return [preferences, setPreferences] as const;
}
export function useReducedMotion(preference: Preferences["motion"]) {
  const [system, setSystem] = useState(
    () =>
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  );
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const change = () => setSystem(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  return preference === "reduce" || system;
}
