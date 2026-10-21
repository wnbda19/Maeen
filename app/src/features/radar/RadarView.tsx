import type { Strings } from "../../localization/strings";
import { Icon } from "../../components/Icon";
import { PageHeading } from "../../components/PageHeading";
import { DeviceError } from "../../components/DeviceError";
import { Status } from "../../accessibility/Status";
import { RadarVisual } from "./RadarVisual";
import { useRadar } from "./useRadar";
import { AudioControls } from "./AudioControls";
export default function RadarView({
  t,
  reducedMotion = false,
}: {
  t: Strings;
  reducedMotion?: boolean;
}) {
  const radar = useRadar(),
    above = radar.active && radar.level > radar.threshold;
  const arabic = t.stop === "إيقاف",
    tr = (ar: string, en: string) => (arabic ? ar : en);
  return (
    <>
      <PageHeading
        eyebrow={t.radarEyebrow}
        title={tr("الرادار الذكي للأصوات", "Smart sound radar")}
        description={tr(
          "تعرف محلي تجريبي على الأصوات المحيطة. لا يحدد الاتجاه أو المسافة ولا يغني عن أنظمة الإنذار.",
          "Experimental on-device environmental sound recognition. It cannot determine direction or distance and does not replace alarm systems.",
        )}
      />
      <p className="radar-current-capability">
        {tr(
          "YAMNet للتعرف على نوع الصوت، مع وضع مستوى الميكروفون كبديل.",
          "YAMNet sound recognition with microphone-level fallback.",
        )}
      </p>
      <div className="radar-layout">
        <section className="radar-monitor" aria-label={t.radarVisual}>
          <div className="media-toolbar">
            <span>
              <Icon name="radar" />
              {t.radar}
            </span>
            <span className={`media-state ${radar.active ? "is-active" : ""}`}>
              <span className="dot" />
              {radar.active ? t.radarListening : t.radarIdle}
            </span>
          </div>
          <RadarVisual
            level={radar.level}
            active={radar.active}
            alert={
              radar.aiState === "listening"
                ? radar.active &&
                  !!radar.soundEvents[0] &&
                  Date.now() - radar.soundEvents[0].at < 5000
                : above
            }
            reducedMotion={reducedMotion}
          />
          <div className="radar-reading">
            <span className="meter-value" dir="ltr">
              {radar.active ? Math.round(radar.level) : "—"}
              <small>dBFS</small>
            </span>
            <label htmlFor="audio-meter">{t.audioLevel}</label>
            <meter
              className="audio-meter"
              id="audio-meter"
              min={-100}
              max={0}
              value={radar.level}
            />
          </div>
          <div className="radar-live-status">
            {radar.soundEvents[0] && (
              <p className="sound-alert" role="status" aria-atomic="true">
                {tr("آخر تنبيه: ", "Latest alert: ")}
                <strong>
                  {arabic
                    ? radar.soundEvents[0].kind.ar
                    : radar.soundEvents[0].kind.en}
                </strong>{" "}
                — {Math.round(radar.soundEvents[0].confidence * 100)}% —{" "}
                {radar.soundEvents[0].kind.priority === "urgent"
                  ? tr("أولوية عالية", "High priority")
                  : tr("تنبيه", "Attention")}{" "}
                —{" "}
                <time>
                  {new Date(radar.soundEvents[0].at).toLocaleTimeString()}
                </time>
              </p>
            )}
            <Status
              announce={false}
              text={
                radar.phase === "loading"
                  ? t.loading
                  : radar.aiState === "listening"
                    ? tr(
                        "الاستماع للأصوات المحددة",
                        "Listening for selected sounds",
                      )
                    : radar.active
                      ? above
                        ? t.loud
                        : t.quiet
                      : t.radarIdle
              }
            />
          </div>
          <p className="sr-only" role="status" aria-atomic="true">
            {radar.active
              ? radar.events[0]
                ? `${t.loud}: ${radar.events[0].level} dBFS`
                : t.radarListening
              : radar.phase === "loading"
                ? t.loading
                : t.radarIdle}
          </p>
          <div className="controls radar-controls">
            <button
              className="primary"
              disabled={radar.busy}
              onClick={() => void radar.start()}
            >
              <Icon name="mic" />
              {t.micStart}
            </button>
            <button
              className="secondary"
              disabled={!radar.busy}
              onClick={radar.stop}
            >
              <Icon name="stop" />
              {t.stop}
            </button>
          </div>
          <DeviceError issue={radar.issue} t={t} />
          <p className="radar-caption">
            {radar.active ? t.radarMeaning : t.radarIdleHelp}
          </p>
        </section>
        <div className="radar-sidebar">
          <AudioControls radar={radar} arabic={arabic} />
          <section className="history-panel">
            <div className="output-heading">
              <h2>{tr("سجل الأصوات", "Sound history")}</h2>
              <button
                className="text-button"
                disabled={!radar.soundEvents.length}
                onClick={radar.clearSoundEvents}
              >
                {t.clear}
              </button>
            </div>
            {!radar.soundEvents.length ? (
              <p>{tr("لا توجد أصوات مؤكدة بعد", "No confirmed sounds yet")}</p>
            ) : (
              <ol className="events">
                {radar.soundEvents.map((e, i) => (
                  <li key={e.at + "-" + i}>
                    <div>
                      <strong>{arabic ? e.kind.ar : e.kind.en}</strong>
                      <time dateTime={new Date(e.at).toISOString()}>
                        {new Date(e.at).toLocaleTimeString()}
                      </time>
                      <span>
                        {e.kind.priority === "urgent"
                          ? tr("أولوية عالية", "High priority")
                          : tr("تنبيه", "Attention")}
                      </span>
                    </div>
                    <span>{Math.round(e.confidence * 100)}%</span>
                  </li>
                ))}
              </ol>
            )}
            {radar.metrics.loadMs > 0 && (
              <p className="muted" dir="ltr">
                YAMNet · load {Math.round(radar.metrics.loadMs)} ms · inference{" "}
                {Math.round(radar.metrics.inferenceMs)} ms
              </p>
            )}
          </section>
          <section className="sensitivity-panel">
            <h2>
              <Icon name="activity" />
              {t.sensitivity}
            </h2>
            <div className="threshold-row">
              <label htmlFor="threshold">{t.threshold}</label>
              <strong dir="ltr">
                {radar.threshold} <small>dBFS</small>
              </strong>
            </div>
            <input
              id="threshold"
              type="range"
              min={-80}
              max={-5}
              value={radar.threshold}
              aria-describedby="sensitivity-help"
              onChange={(e) => radar.updateThreshold(Number(e.target.value))}
            />
            <div className="range-labels">
              <span>{t.moreSensitive}</span>
              <span>{t.lessSensitive}</span>
            </div>
            <p id="sensitivity-help" className="muted">
              {t.sensitivityHelp}
            </p>
          </section>
          <section className="history-panel">
            <div className="output-heading">
              <h2>{t.sessionHistory}</h2>
              <button
                className="text-button"
                onClick={radar.clearEvents}
                disabled={!radar.events.length}
              >
                {t.clear}
              </button>
            </div>
            <p className="muted">{t.historyHelp}</p>
            {!radar.events.length ? (
              <div className="empty-history">
                <Icon name="activity" />
                <p>{t.noEvents}</p>
              </div>
            ) : (
              <ol className="events">
                {radar.events.map((event) => (
                  <li key={event.id}>
                    <Icon name="activity" />
                    <div>
                      <strong>{t.loud}</strong>
                      <time dateTime={new Date(event.id).toISOString()}>
                        {event.time}
                      </time>
                    </div>
                    <span dir="ltr">{event.level} dBFS</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
      <div className="tool-footnote">
        <Icon name="info" />
        <p>
          {tr(
            "تنبيهات احتمالية وليست قياسات سلامة معتمدة. التحطم لا يؤكد أن المادة زجاج.",
            "Alerts are model estimates, not certified safety measurements. Shattering does not confirm the material is glass.",
          )}
          <br />
          <span>{t.noSafety}</span>
        </p>
      </div>
    </>
  );
}
