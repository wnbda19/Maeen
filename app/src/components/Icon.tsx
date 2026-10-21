import type { CSSProperties } from "react";
export type IconName =
  | "home"
  | "hand"
  | "radar"
  | "message"
  | "settings"
  | "arrow"
  | "play"
  | "stop"
  | "camera"
  | "mic"
  | "volume"
  | "search"
  | "check"
  | "shield"
  | "close"
  | "sun"
  | "globe"
  | "type"
  | "activity"
  | "info"
  | "trash";
const paths: Record<IconName, string> = {
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  hand: "M8 12V6a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v7-5a2 2 0 0 1 4 0v9c0 4-3 7-7 7h-1c-3 0-5-2-7-5l-2-4a2 2 0 0 1 3-2l2 2",
  radar:
    "M20 13a8 8 0 1 1-8-9m0 4a4 4 0 1 0 4 4m-4 0 8-8M12 2v2M2 12h2m8 8v2m8-10h2",
  message:
    "M21 11a8 8 0 0 1-8 8H8l-5 3V7a4 4 0 0 1 4-4h6a8 8 0 0 1 8 8ZM7 8h9M7 12h6",
  settings:
    "m9 3 1-1h4l1 1 1 3 3 1 2 3v3l-2 1-1 3-3 2h-4l-1-2-3-1-2-3v-4l2-1 1-3Zm3 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  arrow: "M5 12h14m-6-6 6 6-6 6",
  play: "m9 5 11 7-11 7Z",
  stop: "M6 6h12v12H6Z",
  camera: "M3 7h4l2-3h6l2 3h4v13H3Zm9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  mic: "M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0Zm-4 6v1a7 7 0 0 0 14 0v-1m-7 8v3m-4 0h8",
  volume: "M11 4 6 8H3v8h3l5 4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6",
  check: "m5 12 4 4L19 6",
  shield: "m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Zm-4 9 3 3 5-6",
  close: "m6 6 12 12M6 18 18 6",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8m0-6v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1",
  globe:
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 0c6 5 6 15 0 20-6-5-6-15 0-20M2 12h20",
  type: "M4 4h16M12 4v16m-4 0h8",
  activity: "M2 12h4l3-8 6 16 3-8h4",
  info: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m0 9v6m0-10v.1",
  trash: "M3 6h18M8 6V3h8v3m-11 0 1 15h12l1-15M10 10v7m4-7v7",
};
export function Icon({
  name,
  className = "",
  style,
}: {
  name: IconName;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={`icon ${className}`}
      style={style}
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
