import { useEffect, useRef, useState } from "react";
import { speakArabic, cancelSpeech } from "../services/speech/speak";
import { Status } from "../accessibility/Status";
import { Icon } from "./Icon";
import type { Strings } from "../localization/strings";
export function SpeechControls({ text, t }: { text: string; t: Strings }) {
  const [phase, setPhase] = useState<
    "idle" | "speaking" | "done" | "failed" | "unavailable"
  >("idle");
  const generation = useRef(0);
  useEffect(() => {
    generation.current++;
    cancelSpeech();
    setPhase("idle");
    return () => {
      generation.current++;
      cancelSpeech();
    };
  }, [text]);
  function speak() {
    const token = ++generation.current;
    const ok = speakArabic(
      text,
      () => {
        if (token === generation.current) setPhase("done");
      },
      () => {
        if (token === generation.current) setPhase("failed");
      },
    );
    setPhase(ok ? "speaking" : "unavailable");
  }
  return (
    <div className="speech-controls">
      <div className="controls">
        <button className="primary" disabled={!text.trim()} onClick={speak}>
          <Icon name="volume" />
          {t.speak}
        </button>
        <button
          className="secondary"
          disabled={phase !== "speaking"}
          onClick={() => {
            generation.current++;
            cancelSpeech();
            setPhase("done");
          }}
        >
          <Icon name="stop" />
          {t.stopSpeech}
        </button>
      </div>
      {phase !== "idle" && (
        <Status
          text={
            phase === "speaking"
              ? t.speaking
              : phase === "done"
                ? t.speechDone
                : phase === "failed"
                  ? t.speechFailed
                  : t.speechUnavailable
          }
          error={phase === "failed" || phase === "unavailable"}
        />
      )}
    </div>
  );
}
