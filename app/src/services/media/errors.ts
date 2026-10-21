export type CaptureIssue =
  "permission" | "missing" | "busy" | "unsupported" | "model" | "unknown";
export function captureIssue(
  error: unknown,
  stage: "model" | "capture",
): CaptureIssue {
  if (stage === "model") return "model";
  const name =
    error && typeof error === "object" && "name" in error
      ? String(error.name)
      : "";
  if (name === "NotAllowedError" || name === "SecurityError")
    return "permission";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "missing";
  if (name === "NotReadableError" || name === "AbortError") return "busy";
  if (name === "NotSupportedError") return "unsupported";
  return "unknown";
}
