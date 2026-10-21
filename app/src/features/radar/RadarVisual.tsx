import { Icon } from "../../components/Icon";
export function RadarVisual({
  level,
  active,
  reducedMotion,
  alert,
}: {
  level: number;
  active: boolean;
  reducedMotion: boolean;
  alert: boolean;
}) {
  const amplitude = active ? Math.max(0, Math.min(1, (level + 80) / 80)) : 0;
  return (
    <div
      className={`radar-visual ${active ? "is-listening" : ""} ${alert ? "has-alert" : ""}`}
      aria-hidden="true"
      data-reduced-motion={reducedMotion}
    >
      <span className="radar-axis axis-horizontal" />
      <span className="radar-axis axis-vertical" />
      <span className="radar-track track-outer" />
      <span className="radar-track track-middle" />
      <span className="radar-track track-inner" />
      <span
        className="signal-ring ring-outer"
        style={{
          transform: reducedMotion
            ? "none"
            : `scale(${0.65 + amplitude * 0.35})`,
          opacity: active ? 0.25 + amplitude * 0.6 : 0.15,
        }}
      />
      <span
        className="signal-ring ring-inner"
        style={{
          transform: reducedMotion
            ? "none"
            : `scale(${0.75 + amplitude * 0.25})`,
          opacity: active ? 0.4 + amplitude * 0.5 : 0.2,
        }}
      />
      <span className="radar-center">
        <Icon name="mic" />
      </span>
    </div>
  );
}
