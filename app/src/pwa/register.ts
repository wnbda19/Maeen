import { installMode } from "./install";
type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};
let state = {
  phase: "idle",
  update: false,
  install: false,
  ios: false,
  offline: false,
  standalone: false,
};
const subscribers = new Set<() => void>();
let started = false,
  registration: ServiceWorkerRegistration | null = null,
  prompt: InstallEvent | null = null;
export const getPwaSnapshot = () => state;
export const subscribePwa = (listener: () => void) => {
  subscribers.add(listener);
  return () => {
    subscribers.delete(listener);
  };
};
function set(value: Partial<typeof state>) {
  state = { ...state, ...value };
  subscribers.forEach((fn) => fn());
}
export async function installApp() {
  const event = prompt;
  if (!event) return;
  prompt = null;
  set({ install: false });
  try {
    await event.prompt();
    await event.userChoice;
  } catch {
    /* Browser rejected or dismissed its own install dialog. */
  }
}
export function applyUpdate() {
  if (!registration?.waiting) return;
  window.dispatchEvent(new Event("maeen:shutdown"));
  registration.waiting.postMessage({ type: "ACTIVATE_UPDATE" });
}
export function registerOffline(
  enabled = import.meta.env.PROD,
  reload = () => location.reload(),
) {
  if (!enabled || started) return;
  started = true;
  let disposed = false,
    hadController = Boolean(navigator.serviceWorker?.controller),
    lastCheck = 0;
  const cleanups: (() => void)[] = [];
  const listen = (target: EventTarget, name: string, fn: EventListener) => {
    target.addEventListener(name, fn);
    cleanups.push(() => target.removeEventListener(name, fn));
  };
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const mode = installMode(
    false,
    standalone,
    navigator.userAgent,
    navigator.maxTouchPoints,
  );
  set({
    standalone,
    ios: mode === "ios",
    offline: navigator.onLine === false,
    phase: "unsupported",
  });
  listen(window, "beforeinstallprompt", ((event: InstallEvent) => {
    event.preventDefault();
    if (!state.standalone) {
      prompt = event;
      set({ install: true, ios: false });
    }
  }) as EventListener);
  listen(window, "appinstalled", () => {
    prompt = null;
    set({ install: false, ios: false, standalone: true });
  });
  const check = () => {
    if (registration && Date.now() - lastCheck > 60000) {
      lastCheck = Date.now();
      void registration.update().then(() => {
        if (!disposed && state.phase === "update-error") set({ phase: "ready" });
      }).catch(() => {
        if (!disposed) set({ phase: "update-error" });
      });
    }
  };
  listen(window, "online", () => {
    set({ offline: false });
    check();
  });
  listen(window, "offline", () => set({ offline: true }));
  listen(document, "visibilitychange", () => {
    if (!document.hidden) check();
  });
  if ("serviceWorker" in navigator && window.isSecureContext !== false) {
    set({ phase: "preparing" });
    listen(navigator.serviceWorker, "controllerchange", () => {
      if (hadController) {
        window.dispatchEvent(new Event("maeen:shutdown"));
        reload();
      }
      hadController = true;
    });
    void navigator.serviceWorker
      .register(
        new URL(import.meta.env.BASE_URL + "sw.js", location.href).href,
        {
          scope: new URL(import.meta.env.BASE_URL, location.href).href,
          updateViaCache: "none",
        },
      )
      .then((reg) => {
        if (disposed) return;
        registration = reg;
        set({
          phase: reg.active ? "ready" : "preparing",
          update: Boolean(reg.waiting),
        });
        const watch = () => {
          const worker = reg.installing;
          if (!worker) return;
          listen(worker, "statechange", () => {
            if (worker.state === "installed")
              set({
                phase: "ready",
                update: Boolean(navigator.serviceWorker.controller),
              });
            if (worker.state === "redundant") set({ phase: "error" });
          });
        };
        listen(reg, "updatefound", watch);
        watch();
        void navigator.serviceWorker.ready
          .then(() => {
            if (!disposed) set({ phase: "ready" });
          })
          .catch(() => {});
      })
      .catch(() => {
        if (!disposed) set({ phase: "error" });
      });
  }
  return () => {
    disposed = true;
    cleanups.forEach((fn) => fn());
    started = false;
    registration = null;
    prompt = null;
  };
}
