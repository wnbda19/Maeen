import { useEffect, useRef, useState } from "react";
import { MediaSession } from "../../services/media/session";
import { dbfs } from "../../services/audio/level";
import { captureIssue, type CaptureIssue } from "../../services/media/errors";
import { reportDevice, type DevicePhase } from "../../services/media/status";
import { AudioModel } from "../../services/audio/model";
import {
  SoundFilter,
  SOUND_CLASSES,
  notifySound,
  type SoundDetection,
} from "../../services/audio/events";
export function useRadar() {
  const model = useRef<AudioModel | null>(null),
    capture = useRef<AudioWorkletNode | null>(null),
    filter = useRef(new SoundFilter());
  const [aiState, setAiState] = useState<
    "idle" | "loading" | "listening" | "fallback"
  >("idle");
  const [aiEnabled, setAiEnabled] = useState(true),
    [confidence, setConfidence] = useState(0.65);
  const [categories, setCategories] = useState(SOUND_CLASSES.map((c) => c.id));
  const settings = useRef({ confidence, categories });
  settings.current = { confidence, categories };
  const [soundEvents, setSoundEvents] = useState<
    (SoundDetection & { at: number })[]
  >([]);
  const [metrics, setMetrics] = useState({ loadMs: 0, inferenceMs: 0 });
  const [notifications, setNotifications] = useState(false),
    [vibration, setVibration] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof Notification === "undefined"
      ? "unsupported"
      : Notification.permission,
  );
  const alertOptions = useRef({ notifications, vibration });
  alertOptions.current = { notifications, vibration };
  const session = useRef(new MediaSession()),
    context = useRef<AudioContext | null>(null),
    releaseTracks = useRef<(() => void) | null>(null),
    raf = useRef(0),
    generation = useRef(0),
    thresholdRef = useRef(-25);
  const [phase, setPhase] = useState<DevicePhase>("idle"),
    [issue, setIssue] = useState<CaptureIssue | null>(null),
    [level, setLevel] = useState(-100),
    [threshold, setThreshold] = useState(-25),
    [events, setEvents] = useState<
      { time: string; level: number; id: number }[]
    >([]);
  function changePhase(value: DevicePhase) {
    setPhase(value);
    reportDevice("microphone", value);
  }
  function stop() {
    generation.current++;
    capture.current?.disconnect();
    capture.current = null;
    model.current?.close();
    model.current = null;
    setAiState("idle");
    cancelAnimationFrame(raf.current);
    releaseTracks.current?.();
    releaseTracks.current = null;
    session.current.stop();
    if (context.current) context.current.onstatechange = null;
    void context.current?.close().catch(() => {});
    context.current = null;
    changePhase("idle");
    setLevel(-100);
    setIssue(null);
  }
  useEffect(() => {
    const hidden = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", stop);
    document.addEventListener("freeze", stop);
    window.addEventListener("maeen:shutdown", stop);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", stop);
      document.removeEventListener("freeze", stop);
      window.removeEventListener("maeen:shutdown", stop);
      stop();
    };
  }, []);
  async function start() {
    stop();
    const token = generation.current;
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof AudioContext === "undefined" ||
      window.isSecureContext === false
    ) {
      setIssue("unsupported");
      changePhase("unsupported");
      return;
    }
    changePhase("loading");
    try {
      const ctx = new AudioContext();
      context.current = ctx;
      await ctx.resume();
      if (token !== generation.current) return;
      const stream = await session.current.start({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      });
      if (!stream || token !== generation.current) return;
      const interrupted = () => {
        if (token === generation.current) {
          stop();
          setIssue("busy");
          changePhase("error");
        }
      };
      stream.getTracks().forEach((track) => {
        track.addEventListener("ended", interrupted, { once: true });
        track.addEventListener("mute", interrupted, { once: true });
      });
      releaseTracks.current = () =>
        stream.getTracks().forEach((track) => {
          track.removeEventListener?.("ended", interrupted);
          track.removeEventListener?.("mute", interrupted);
        });
      ctx.onstatechange = () => {
        if (
          ctx.state === "suspended" ||
          (ctx.state as string) === "interrupted"
        )
          interrupted();
      };
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      const data = new Float32Array(analyser.fftSize);
      let lastUI = 0,
        lastAlert = -Infinity;
      changePhase("active");
      let aiRunning = false;
      if (aiEnabled) {
        setAiState("loading");
        const engine = new AudioModel();
        model.current = engine;
        const fallback = () => {
          if (token !== generation.current) return;
          aiRunning = false;
          engine.close();
          capture.current?.disconnect();
          capture.current = null;
          setAiState("fallback");
        };
        void (async () => {
          try {
            const loadMs = await engine.load(
              new URL(import.meta.env.BASE_URL, location.href).href,
            );
            if (token !== generation.current) {
              engine.close();
              return;
            }
            await ctx.audioWorklet.addModule(
              import.meta.env.BASE_URL + "audio-capture.js",
            );
            if (token !== generation.current) return;
            filter.current = new SoundFilter();
            filter.current.configure(
              settings.current.confidence,
              settings.current.categories,
            );
            engine.onFailure = fallback;
            engine.onResult = (scores, inferenceMs) => {
              if (token !== generation.current) return;
              setMetrics({ loadMs, inferenceMs });
              const event = filter.current.push(scores, performance.now());
              if (event) {
                setSoundEvents((previous) =>
                  [{ ...event, at: Date.now() }, ...previous].slice(0, 30),
                );
                notifySound(
                  event.kind.ar + " / " + event.kind.en,
                  alertOptions.current.notifications,
                  alertOptions.current.vibration,
                );
              }
            };
            const node = new AudioWorkletNode(ctx, "maeen-capture");
            capture.current = node;
            node.onprocessorerror = fallback;
            node.port.onmessage = ({ data }) => {
              if (token === generation.current)
                engine.infer(data, ctx.sampleRate);
            };
            source.connect(node);
            node.connect(ctx.destination);
            aiRunning = true;
            setMetrics({ loadMs, inferenceMs: 0 });
            setAiState("listening");
          } catch {
            fallback();
          }
        })();
      } else setAiState("fallback");
      const tick = () => {
        if (token !== generation.current) return;
        try {
          analyser.getFloatTimeDomainData(data);
          const value = dbfs(data),
            now = performance.now();
          if (now - lastUI > 150) {
            setLevel(value);
            lastUI = now;
          }
          if (
            !aiRunning &&
            value > thresholdRef.current &&
            now - lastAlert > 5000
          ) {
            lastAlert = now;
            setEvents((previous) =>
              [
                {
                  time: new Date().toLocaleTimeString(),
                  level: Math.round(value),
                  id: Date.now(),
                },
                ...previous,
              ].slice(0, 20),
            );
          }
          raf.current = requestAnimationFrame(tick);
        } catch {
          stop();
          setIssue("unknown");
          changePhase("error");
        }
      };
      tick();
    } catch (error) {
      if (token === generation.current) {
        stop();
        setIssue(captureIssue(error, "capture"));
        changePhase("error");
      }
    }
  }
  function updateThreshold(value: number) {
    setThreshold(value);
    thresholdRef.current = value;
  }
  return {
    aiState,
    aiEnabled,
    setAiEnabled,
    confidence,
    categories,
    soundEvents,
    metrics,
    setConfidence: (value: number) => {
      setConfidence(value);
      filter.current.configure(value, categories);
    },
    setCategories: (value: string[]) => {
      setCategories(value);
      filter.current.configure(confidence, value);
    },
    clearSoundEvents: () => setSoundEvents([]),
    notifications,
    notificationPermission,
    vibration,
    setVibration,
    requestNotifications: async () => {
      try {
        if (typeof Notification !== "undefined") {
          const p = await Notification.requestPermission();
          setNotificationPermission(p);
          setNotifications(p === "granted");
        }
      } catch {
        setNotifications(false);
        setNotificationPermission("unavailable");
      }
    },
    setNotifications,
    phase,
    issue,
    level,
    threshold,
    updateThreshold,
    events,
    clearEvents: () => setEvents([]),
    start,
    stop,
    active: phase === "active",
    busy: phase === "active" || phase === "loading",
  };
}
