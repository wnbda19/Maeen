import { useEffect, useRef, useState } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";
import { createHands } from "../../services/landmarks/hands";
import {
  loadSignModel,
  type SignLanguageId,
  type SignModel,
} from "../../services/signs/registry";
import { Stabilizer } from "../../services/recognition/stability";
import { MediaSession } from "../../services/media/session";
import { drawHand } from "../../services/landmarks/draw";
import { captureIssue, type CaptureIssue } from "../../services/media/errors";
import { reportDevice, type DevicePhase } from "../../services/media/status";

/** Shared camera lifecycle with independent, lazily loaded sign-language adapters. */
export function useTranslator(language: SignLanguageId = "arsl") {
  const model = useRef<SignModel | null>(null);
  const video = useRef<HTMLVideoElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    session = useRef(new MediaSession()),
    generation = useRef(0),
    frame = useRef(0),
    detector = useRef<HandLandmarker | null>(null),
    abort = useRef<AbortController | null>(null),
    releaseTracks = useRef<(() => void) | null>(null);
  const [phase, setPhase] = useState<DevicePhase>("idle"),
    [stage, setStage] = useState<"model" | "capture">("model"),
    [issue, setIssue] = useState<CaptureIssue | null>(null),
    [facing, setFacing] = useState("user"),
    [text, setText] = useState(""),
    [label, setLabel] = useState(""),
    [score, setScore] = useState(0),
    [hasHand, setHasHand] = useState(false);
  function changePhase(value: DevicePhase) {
    setPhase(value);
    reportDevice("camera", value);
  }
  function stop() {
    generation.current++;
    abort.current?.abort();
    cancelAnimationFrame(frame.current);
    releaseTracks.current?.();
    releaseTracks.current = null;
    session.current.stop();
    detector.current?.close();
    detector.current = null;
    model.current?.dispose();
    model.current = null;
    if (video.current) video.current.srcObject = null;
    if (canvas.current) drawHand(canvas.current, undefined, 640, 480);
    changePhase("idle");
    setLabel("");
    setScore(0);
    setHasHand(false);
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
  useEffect(() => {
    stop();
    setText("");
  }, [language]);
  async function start() {
    stop();
    const token = generation.current;
    if (
      !navigator.mediaDevices?.getUserMedia ||
      window.isSecureContext === false
    ) {
      setIssue("unsupported");
      changePhase("unsupported");
      return;
    }
    changePhase("loading");
    setStage("model");
    const controller = new AbortController();
    abort.current = controller;
    let currentStage: "model" | "capture" = "model";
    try {
      const recognition = await loadSignModel(language, controller.signal);
      if (token !== generation.current) {
        recognition.dispose();
        return;
      }
      model.current = recognition;
      const hands = await createHands();
      if (token !== generation.current) {
        hands.close();
        return;
      }
      detector.current = hands;
      currentStage = "capture";
      setStage("capture");
      const stream = await session.current.start({
        video: {
          facingMode: facing,
          width: { ideal: 960 },
          height: { ideal: 720 },
        },
        audio: false,
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
      const element = video.current;
      if (!element) throw new Error("Video unavailable");
      element.srcObject = stream;
      await element.play();
      if (token !== generation.current) return;
      changePhase("active");
      const stable = new Stabilizer();
      let lastFrame = -1,
        lastUI = 0;
      const tick = () => {
        if (token !== generation.current) return;
        try {
          if (element.readyState >= 2 && element.currentTime !== lastFrame) {
            lastFrame = element.currentTime;
            const now = performance.now(),
              resultHands = hands.detectForVideo(element, now),
              hand = resultHands.landmarks[0];
            if (canvas.current)
              drawHand(
                canvas.current,
                hand,
                element.videoWidth,
                element.videoHeight,
              );
            const result = recognition.predict(
              hand,
              resultHands.handedness?.[0]?.[0]?.categoryName ?? "Unknown",
            );
            const accepted = stable.accept(result);
            if (accepted) setText((previous) => previous + accepted);
            if (now - lastUI > 150) {
              setLabel(stable.current);
              setScore(result?.score ?? 0);
              setHasHand(Boolean(hand));
              lastUI = now;
            }
          }
          frame.current = requestAnimationFrame(tick);
        } catch {
          stop();
          setIssue("model");
          changePhase("error");
        }
      };
      frame.current = requestAnimationFrame(tick);
    } catch (error) {
      if (token !== generation.current) return;
      stop();
      setIssue(captureIssue(error, currentStage));
      changePhase("error");
    }
  }
  return {
    video,
    canvas,
    phase,
    stage,
    issue,
    facing,
    setFacing,
    text,
    setText,
    label,
    score,
    hasHand,
    start,
    stop,
    busy: phase === "loading" || phase === "active",
  };
}
