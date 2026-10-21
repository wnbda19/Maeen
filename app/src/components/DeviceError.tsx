import type { CaptureIssue } from "../services/media/errors";
import type { Strings } from "../localization/strings";
import { Status } from "../accessibility/Status";
import { offlineModelMessage } from "../pwa/offline";
export function DeviceError({
  issue,
  t,
}: {
  issue: CaptureIssue | null;
  t: Strings;
}) {
  if (!issue) return null;
  const messages: Record<CaptureIssue, string> = {
    permission: t.permissionError,
    missing: t.missingError,
    busy: t.busyError,
    unsupported: t.unsupportedError,
    model: t.modelError,
    unknown: t.unknownError,
  };
  return (
    <Status
      text={
        issue === "model" && navigator.onLine === false
          ? offlineModelMessage(t.stop === "إيقاف")
          : messages[issue]
      }
      error
    />
  );
}
