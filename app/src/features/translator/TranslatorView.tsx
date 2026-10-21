import type { Strings } from "../../localization/strings";
import { PageHeading } from "../../components/PageHeading";
import { Icon } from "../../components/Icon";
import { SpeechButton } from "../../components/SpeechButton";
import { DeviceError } from "../../components/DeviceError";
import { Status } from "../../accessibility/Status";
import { useTranslator } from "./useTranslator";
import { useState } from "react";
import LearnSigns from "./LearnSigns";
import WordMode from "./WordMode";
import {
  getSignLanguage,
  type SignLanguageId,
} from "../../services/signs/registry";
import { SignLanguagePanel, UnsupportedSignMode } from "./SignLanguagePanel";
export default function TranslatorView({ t }: { t: Strings }) {
  const [languageId, setLanguageId] = useState<SignLanguageId>("arsl");
  const language = getSignLanguage(languageId),
    arabic = t.stop === "إيقاف",
    tr = (ar: string, en: string) => (arabic ? ar : en);
  const camera = useTranslator(languageId);
  const [mode, setMode] = useState<"letters" | "words" | "learn">("letters");
  const [copyStatus, setCopyStatus] = useState("");
  async function copyText() {
    try {
      await navigator.clipboard.writeText(camera.text);
      setCopyStatus(t.copied);
    } catch {
      setCopyStatus(t.copyFailed);
    }
  }
  const stateText =
    camera.phase === "loading"
      ? camera.stage === "model"
        ? t.modelLoading
        : t.cameraOpening
      : camera.phase === "active"
        ? t.modelReady
        : t.idle;
  return (
    <>
      <PageHeading
        eyebrow={
          languageId !== "arsl"
            ? tr("لغة إشارة مستقلة", "Independent sign language")
            : mode === "letters"
              ? t.recognitionScope
              : mode === "words"
                ? t.futureState
                : t.learnMode
        }
        title={
          languageId !== "arsl"
            ? language.displayName
            : mode === "letters"
              ? t.cameraTitle
              : mode === "words"
                ? t.wordTitle
                : t.learnTitle
        }
        description={
          languageId !== "arsl"
            ? tr(
                "حدد الوضع وراجع حالة النموذج والمفردات قبل تشغيل الكاميرا.",
                "Choose a mode and review model status and vocabulary before starting the camera.",
              )
            : mode === "letters"
              ? t.cameraInfo
              : mode === "words"
                ? t.wordInfo
                : t.learnInfo
        }
      />
      <SignLanguagePanel
        language={language}
        arabic={arabic}
        onChange={(id) => {
          camera.stop();
          camera.setText("");
          setCopyStatus("");
          setLanguageId(id);
        }}
      />
      <div className="translator-modes" role="group" aria-label={t.modeLabel}>
        {(["letters", "words"] as const).map((value) => (
          <button
            key={value}
            className="mode-choice"
            aria-pressed={mode === value}
            onClick={() => {
              camera.stop();
              setCopyStatus("");
              setMode(value);
            }}
          >
            <strong>
              {languageId === "arsl"
                ? value === "letters"
                  ? t.lettersMode
                  : t.wordsMode
                : value === "letters"
                  ? tr("الحروف", "Letters")
                  : tr("الكلمات", "Words")}
            </strong>
            <span>
              {languageId === "arsl"
                ? value === "letters"
                  ? t.lettersDetail
                  : t.wordsDetail
                : value === "letters" && language.letters.supported
                  ? tr("نموذج تجريبي", "Experimental model")
                  : tr("نموذج غير متاح", "Model unavailable")}
            </span>
          </button>
        ))}
      </div>
      <button
        className="learn-link"
        aria-pressed={mode === "learn"}
        onClick={() => {
          camera.stop();
          setMode("learn");
        }}
      >
        <Icon name="hand" />
        {t.learnMode}
      </button>
      {languageId !== "arsl" &&
      (mode !== "letters" || !language.letters.supported) ? (
        <UnsupportedSignMode language={language} arabic={arabic} mode={mode} />
      ) : mode === "learn" ? (
        <LearnSigns t={t} />
      ) : mode === "words" ? (
        <WordMode t={t} />
      ) : (
        <>
          <div className="translator-layout">
            <section className="camera-workspace" aria-label={t.cameraPreview}>
              <div className="media-toolbar">
                <span>
                  <Icon name="camera" />
                  {t.cameraPreview}
                </span>
                <span
                  className={`media-state ${camera.phase === "active" ? "is-active" : ""}`}
                >
                  <span className="dot" />
                  {camera.phase === "active" ? t.active : t.idle}
                </span>
              </div>
              <div
                className={`video-frame ${camera.phase === "active" ? "is-live" : ""}`}
              >
                <video
                  ref={camera.video}
                  muted
                  playsInline
                  aria-label={t.camera}
                  style={{
                    transform:
                      camera.facing === "user" ? "scaleX(-1)" : undefined,
                  }}
                />
                <canvas
                  ref={camera.canvas}
                  className="landmarks"
                  aria-hidden="true"
                  style={{
                    transform:
                      camera.facing === "user" ? "scaleX(-1)" : undefined,
                  }}
                />
                {camera.phase !== "active" && (
                  <div className="video-placeholder">
                    <span className="camera-outline">
                      <Icon name="hand" />
                    </span>
                    <strong>
                      {camera.phase === "loading" ? stateText : t.cameraPrepare}
                    </strong>
                    <p>{t.cameraPrepareInfo}</p>
                    <span className="viewfinder-corner corner-one" />
                    <span className="viewfinder-corner corner-two" />
                    <span className="viewfinder-corner corner-three" />
                    <span className="viewfinder-corner corner-four" />
                  </div>
                )}
              </div>
              <div className="camera-controls">
                <div className="controls">
                  <button
                    className="primary"
                    onClick={() => void camera.start()}
                    disabled={camera.busy}
                  >
                    <Icon name="camera" />
                    {t.start}
                  </button>
                  <button
                    className="secondary"
                    onClick={camera.stop}
                    disabled={!camera.busy}
                  >
                    <Icon name="stop" />
                    {t.stop}
                  </button>
                </div>
                <label className="camera-select">
                  {t.camera}
                  <select
                    value={camera.facing}
                    disabled={camera.busy}
                    onChange={(e) => camera.setFacing(e.target.value)}
                  >
                    <option value="user">{t.front}</option>
                    <option value="environment">{t.rear}</option>
                  </select>
                </label>
              </div>
              <DeviceError issue={camera.issue} t={t} />
              {!camera.issue && <Status text={stateText} />}
              <p className="media-privacy">
                <Icon name="shield" />
                {t.cameraLocal}
              </p>
            </section>
            <div className="translator-output">
              <section className="recognition-result">
                <div className="section-label">
                  <Icon name="hand" />
                  {t.detectedCharacter}
                </div>
                <div
                  className="detected-letter"
                  lang={language.textLanguage}
                  dir={language.direction}
                  role="status"
                  aria-label={t.detectedCharacter}
                  aria-atomic="true"
                >
                  {camera.label || "—"}
                </div>
                <p className="recognition-status">
                  {camera.phase !== "active"
                    ? t.idle
                    : !camera.hasHand
                      ? t.noSign
                      : camera.label
                        ? t.active
                        : languageId === "arsl"
                          ? t.uncertain
                          : tr("إشارة غير معروفة", "Unknown sign")}
                </p>
                <div className="vote-row">
                  <label htmlFor="vote-meter">
                    {languageId === "arsl"
                      ? t.voteShare
                      : tr("درجة النموذج", "Model score")}
                  </label>
                  <span dir="ltr">
                    {camera.hasHand
                      ? `${Math.round(camera.score * 100)}%`
                      : "—"}
                  </span>
                </div>
                <meter id="vote-meter" min={0} max={1} value={camera.score} />
                <p className="score-help">
                  {languageId === "arsl"
                    ? t.voteHelp
                    : tr(
                        "درجة MLP ملساء؛ ليست احتمالاً معايراً أو دقة للكاميرا الحية.",
                        "Smoothed MLP score; not calibrated probability or live webcam accuracy.",
                      )}
                </p>
              </section>
              <section className="text-output">
                <div className="output-heading">
                  <label htmlFor="letter-buffer">{t.buffer}</label>
                  <span className="state-badge">
                    {language.id === "arsl" ? "AR" : language.id.toUpperCase()}
                  </span>
                </div>
                <p className="muted" id="output-help">
                  {languageId === "arsl"
                    ? t.outputHelp
                    : tr(
                        "تُضاف الحروف المستقرة هنا. يمكنك تحرير النص ونسخه.",
                        "Stable letters appear here. Edit or copy the composed text.",
                      )}
                </p>
                <textarea
                  id="letter-buffer"
                  aria-describedby="output-help"
                  lang={language.textLanguage}
                  dir={language.direction}
                  rows={4}
                  value={camera.text}
                  onChange={(e) => camera.setText(e.target.value)}
                  placeholder="…"
                />
                <p className="sr-only" role="status" aria-atomic="true">
                  {camera.text}
                </p>
                <div className="output-edit">
                  <button
                    className="text-button"
                    disabled={!camera.label || camera.phase !== "active"}
                    onClick={() => camera.setText((s) => s + camera.label)}
                  >
                    {t.addLetter}
                  </button>
                  <button
                    className="text-button"
                    disabled={!camera.text}
                    onClick={() =>
                      camera.setText((s) => Array.from(s).slice(0, -1).join(""))
                    }
                  >
                    {t.deleteLetter}
                  </button>
                  <button
                    className="text-button"
                    disabled={!camera.text}
                    onClick={() => void copyText()}
                  >
                    {t.copyText}
                  </button>
                  <button
                    className="text-button"
                    onClick={() => camera.setText((s) => s + " ")}
                  >
                    {t.space}
                  </button>
                  <button
                    className="text-button"
                    onClick={() => camera.setText("")}
                    disabled={!camera.text}
                  >
                    <Icon name="trash" />
                    {t.clear}
                  </button>
                </div>
                <p className="muted">{t.autoAppend}</p>
                <p role="status">{copyStatus}</p>
                {languageId === "arsl" ? (
                  <SpeechButton text={camera.text} t={t} />
                ) : (
                  <p className="muted">
                    {tr(
                      "النطق غير موصل لهذا الوضع؛ يمكنك نسخ النص.",
                      "Speech is not connected for this mode; copy the composed text instead.",
                    )}
                  </p>
                )}
              </section>
            </div>
          </div>
        </>
      )}
      {mode === "letters" && languageId === "arsl" && (
        <div className="tool-footnote">
          <Icon name="info" />
          <p>
            {t.cameraHint}
            <br />
            <span>
              {tr(
                "اختر لغة الإشارة لعرض حالة نموذجها. الكلمات غير متاحة بعد.",
                "Choose a sign language to view its model status. Word recognition remains unavailable.",
              )}
            </span>
          </p>
        </div>
      )}
      {languageId === "asl" && mode === "letters" && (
        <section className="panel">
          <h2>{tr("الحروف المدعومة", "Supported letters")}</h2>
          <p dir="ltr">{language.vocabulary.letters.join(" · ")}</p>
          <p>
            {tr(
              "J و Z يحتاجان إلى تعرف زمني على الحركة وغير مدعومين.",
              "J and Z require temporal motion recognition and are unsupported.",
            )}
          </p>
        </section>
      )}
    </>
  );
}
