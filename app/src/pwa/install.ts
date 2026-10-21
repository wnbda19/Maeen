export function installMode(
  prompt: boolean,
  standalone: boolean,
  userAgent: string,
  touchPoints: number,
): "prompt" | "ios" | "none" {
  if (standalone) return "none";
  if (prompt) return "prompt";
  return /iPad|iPhone|iPod/.test(userAgent) ||
    (/Macintosh/.test(userAgent) && touchPoints > 1)
    ? "ios"
    : "none";
}
