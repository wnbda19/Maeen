import { useSyncExternalStore } from "react";
import {
  getPwaSnapshot,
  subscribePwa,
  applyUpdate,
  installApp,
} from "./register";
export function PwaExperience({ arabic }: { arabic: boolean }) {
  const s = useSyncExternalStore(subscribePwa, getPwaSnapshot, getPwaSnapshot),
    tr = (ar: string, en: string) => (arabic ? ar : en);
  if (s.phase === "idle") return null;
  return (
    <aside
      className="pwa-status"
      aria-label={tr(
        "التثبيت والعمل دون اتصال",
        "Install and offline availability",
      )}
    >
      <p role="status">
        {s.offline
          ? tr(
              "أنت دون اتصال. تعمل النماذج التي اكتمل تنزيلها سابقاً؛ الأذونات ودعم الجهاز ما زالت مطلوبة.",
              "You are offline. Previously downloaded models can work; permissions and device support are still required.",
            )
          : s.phase === "ready"
            ? tr(
                "التطبيق جاهز دون اتصال. شغّل كل ميزة ذكاء مرة عبر الإنترنت لحفظ ملفاتها.",
                "App ready offline. Start each AI feature once online to save its files.",
              )
            : s.phase === "preparing"
              ? tr(
                  "جارٍ تجهيز التطبيق للعمل دون اتصال…",
                  "Preparing the app for offline use…",
                )
              : s.phase === "update-error"
                ? tr(
                    "تعذر التحقق من التحديث. الإصدار الحالي ما زال متاحاً؛ أعد الاتصال وستتم المحاولة مجدداً.",
                    "Update check failed. The current version remains available; reconnect to retry.",
                  )
              : s.phase === "error"
                ? tr(
                    "تعذر تجهيز العمل دون اتصال. يمكنك استخدام الميزات المتاحة عبر الإنترنت.",
                    "Offline setup failed. Available online features remain usable.",
                  )
                : tr(
                    "العمل دون اتصال غير متاح في هذا المتصفح.",
                    "Offline installation is unavailable in this browser.",
                  )}
      </p>
      {s.install && !s.standalone && (
        <button className="secondary" onClick={() => void installApp()}>
          {tr("تثبيت مُعِين", "Install MAEEN")}
        </button>
      )}
      {s.update && (
        <button className="secondary" onClick={applyUpdate}>
          {tr("تحديث التطبيق وإعادة التحميل", "Update app and reload")}
        </button>
      )}
      {s.ios && !s.standalone && (
        <details>
          <summary>
            {tr("إضافة مُعِين إلى الشاشة الرئيسية", "Add MAEEN to Home Screen")}
          </summary>
          <p>
            {tr(
              "افتح قائمة المشاركة في المتصفح، ثم «إضافة إلى الشاشة الرئيسية». قد تختلف الخيارات بحسب إصدار النظام والمتصفح.",
              "Open the browser Share menu, then Add to Home Screen. Options vary by browser and OS version.",
            )}
          </p>
        </details>
      )}
    </aside>
  );
}
