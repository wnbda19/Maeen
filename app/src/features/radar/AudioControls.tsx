import { SOUND_CLASSES } from "../../services/audio/events";
import { offlineModelMessage } from "../../pwa/offline";
import type { useRadar } from "./useRadar";
export function AudioControls({
  radar,
  arabic,
}: {
  radar: ReturnType<typeof useRadar>;
  arabic: boolean;
}) {
  const tr = (ar: string, en: string) => (arabic ? ar : en);
  return (
    <section className="sensitivity-panel audio-ai-controls">
      <h2>{tr("التعرف على الأصوات", "Sound recognition")}</h2>
      {radar.aiState === "fallback" &&
        radar.aiEnabled &&
        navigator.onLine === false && (
          <p role="status">{offlineModelMessage(arabic)}</p>
        )}
      <label>
        <input
          type="checkbox"
          checked={radar.aiEnabled}
          disabled={radar.busy}
          onChange={(e) => radar.setAiEnabled(e.target.checked)}
        />
        {tr("استخدام YAMNet على الجهاز", "Use on-device YAMNet")}
      </label>
      <p role="status">
        {
          {
            idle: tr("متوقف", "Stopped"),
            loading: tr("تحميل نموذج الصوت…", "Loading sound model…"),
            listening: tr("التعرف يعمل محلياً", "Recognition running locally"),
            fallback: tr(
              "وضع مستوى الميكروفون — التعرف غير متاح أو معطل",
              "Microphone-level mode — recognition unavailable or disabled",
            ),
          }[radar.aiState]
        }
      </p>
      <label htmlFor="sound-confidence">
        {tr("حد الثقة", "Confidence threshold")}:{" "}
        {Math.round(radar.confidence * 100)}%
      </label>
      <input
        id="sound-confidence"
        type="range"
        min=".1"
        max=".99"
        step=".01"
        value={radar.confidence}
        onChange={(e) => radar.setConfidence(Number(e.target.value))}
      />
      <details open>
        <summary>{tr("الأصوات المطلوبة", "Sound categories")}</summary>
        <fieldset>
          <legend className="sr-only">
            {tr("الأصوات المطلوبة", "Sound categories")}
          </legend>
          {SOUND_CLASSES.map((c) => (
            <label key={c.id} style={{ display: "block" }}>
              <input
                type="checkbox"
                checked={radar.categories.includes(c.id)}
                onChange={(e) =>
                  radar.setCategories(
                    e.target.checked
                      ? [...radar.categories, c.id]
                      : radar.categories.filter((id) => id !== c.id),
                  )
                }
              />
              {arabic ? c.ar : c.en}
            </label>
          ))}
        </fieldset>
      </details>
      <label>
        <input
          type="checkbox"
          checked={radar.vibration}
          disabled={typeof navigator.vibrate !== "function"}
          onChange={(e) => radar.setVibration(e.target.checked)}
        />
        {tr("اهتزاز عند الدعم", "Vibration where supported")}
      </label>
      <button
        className="secondary"
        disabled={typeof Notification === "undefined"}
        onClick={() =>
          radar.notifications
            ? radar.setNotifications(false)
            : void radar.requestNotifications()
        }
      >
        {radar.notifications
          ? tr("إيقاف الإشعارات", "Disable notifications")
          : tr("السماح بالإشعارات", "Enable notifications")}
      </button>
      {["denied", "unsupported", "unavailable"].includes(
        radar.notificationPermission,
      ) && (
        <p role="status">
          {tr(
            "إشعارات المتصفح غير متاحة أو غير مسموحة. التنبيه المرئي يبقى متاحاً.",
            "Browser notifications unavailable or denied. Visible alerts remain available.",
          )}
        </p>
      )}
      <p className="muted">
        {tr(
          "الصوت يبقى في ذاكرة الجهاز ولا يُحفظ أو يُرفع. قد تفوت أصوات قصيرة أو بعيدة.",
          "Audio stays in device memory and is never saved or uploaded. Short or distant sounds may be missed.",
        )}
      </p>
    </section>
  );
}
