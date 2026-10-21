export type SoundKind = {
  id: string;
  en: string;
  ar: string;
  priority: "urgent" | "attention";
  labels: string[];
};
export const SOUND_CLASSES: SoundKind[] = [
  {
    id: "fire",
    en: "Smoke / fire alarm",
    ar: "إنذار دخان أو حريق",
    priority: "urgent",
    labels: ["Smoke detector, smoke alarm", "Fire alarm"],
  },
  {
    id: "siren",
    en: "Emergency siren",
    ar: "صفارة طوارئ",
    priority: "urgent",
    labels: [
      "Siren",
      "Civil defense siren",
      "Police car (siren)",
      "Ambulance (siren)",
      "Fire engine, fire truck (siren)",
    ],
  },
  {
    id: "horn",
    en: "Vehicle horn",
    ar: "بوق مركبة",
    priority: "attention",
    labels: ["Vehicle horn, car horn, honking", "Air horn, truck horn"],
  },
  {
    id: "doorbell",
    en: "Doorbell",
    ar: "جرس الباب",
    priority: "attention",
    labels: ["Doorbell"],
  },
  {
    id: "knock",
    en: "Knocking",
    ar: "طرق الباب",
    priority: "attention",
    labels: ["Knock"],
  },
  {
    id: "phone",
    en: "Telephone ringing",
    ar: "رنين الهاتف",
    priority: "attention",
    labels: ["Telephone bell ringing", "Ringtone"],
  },
  {
    id: "shatter",
    en: "Shattering",
    ar: "تحطم",
    priority: "attention",
    labels: ["Shatter"],
  },
  {
    id: "baby",
    en: "Baby crying",
    ar: "بكاء طفل",
    priority: "attention",
    labels: ["Baby cry, infant cry"],
  },
  {
    id: "dog",
    en: "Dog barking",
    ar: "نباح كلب",
    priority: "attention",
    labels: ["Bark"],
  },
  {
    id: "shout",
    en: "Shouting / screaming",
    ar: "صياح أو صراخ",
    priority: "urgent",
    labels: ["Shout", "Children shouting", "Screaming"],
  },
];
export type SoundScore = { categoryName: string; score: number };
export type SoundDetection = { kind: SoundKind; confidence: number };
export class SoundFilter {
  private threshold = 0.65;
  private enabled = new Set(SOUND_CLASSES.map((c) => c.id));
  private candidate = "";
  private streak = 0;
  private lastTime = -Infinity;
  private lastAlert = new Map<string, number>();
  private latched = new Set<string>();
  private absent = new Map<string, number>();
  configure(threshold: number, enabled: string[]) {
    this.threshold = Number.isFinite(threshold)
      ? Math.max(0.1, Math.min(0.99, threshold))
      : 0.65;
    this.enabled = new Set(enabled);
    this.candidate = "";
    this.streak = 0;
  }
  push(scores: SoundScore[], now: number): SoundDetection | null {
    if (!Number.isFinite(now)) return null;
    const candidates = SOUND_CLASSES.filter((c) => this.enabled.has(c.id)).map(
      (kind) => ({
        kind,
        confidence: Math.max(
          0,
          ...scores
            .filter(
              (s) =>
                kind.labels.includes(s.categoryName) &&
                Number.isFinite(s.score) &&
                s.score >= 0 &&
                s.score <= 1,
            )
            .map((s) => s.score),
        ),
      }),
    );
    for (const c of candidates) {
      if (c.confidence >= this.threshold) this.absent.set(c.kind.id, 0);
      else {
        const n = (this.absent.get(c.kind.id) ?? 0) + 1;
        this.absent.set(c.kind.id, n);
        if (n >= 3) this.latched.delete(c.kind.id);
      }
    }
    const best = candidates.sort((a, b) => b.confidence - a.confidence)[0];
    if (!best || best.confidence < this.threshold) {
      this.streak = 0;
      this.candidate = "";
      this.lastTime = now;
      return null;
    }
    this.streak =
      this.candidate === best.kind.id &&
      now - this.lastTime <= 1500 &&
      now > this.lastTime
        ? this.streak + 1
        : 1;
    this.candidate = best.kind.id;
    this.lastTime = now;
    if (
      this.streak < 2 ||
      this.latched.has(best.kind.id) ||
      now - (this.lastAlert.get(best.kind.id) ?? -Infinity) < 10000
    )
      return null;
    this.latched.add(best.kind.id);
    this.lastAlert.set(best.kind.id, now);
    return best;
  }
}
export function notifySound(
  title: string,
  notifications: boolean,
  vibration: boolean,
  adapter?: {
    permission: string;
    send: (title: string) => unknown;
    vibrate: (pattern: number[]) => unknown;
  },
) {
  const a = adapter ?? {
    permission:
      typeof Notification === "undefined"
        ? "unsupported"
        : Notification.permission,
    send: async (title: string) => {
      const options = { tag: "maeen-sound", body: title };
      const registration =
        "serviceWorker" in navigator
          ? await navigator.serviceWorker.getRegistration()
          : undefined;
      if (registration)
        await registration.showNotification("MAEEN — " + title, options);
      else new Notification("MAEEN — " + title, options);
    },
    vibrate: (pattern: number[]) => navigator.vibrate?.(pattern),
  };
  if (vibration)
    try {
      a.vibrate([200, 100, 200]);
    } catch {
      /* Unsupported platform. */
    }
  if (notifications && a.permission === "granted")
    try {
      void Promise.resolve(a.send(title)).catch(() => {});
    } catch {
      /* Visible alert remains available. */
    }
}
