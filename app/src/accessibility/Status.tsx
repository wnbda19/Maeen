/** Shared visual and assistive-technology notification; never audio-only. */
export function Status({
  text,
  error = false,
  announce = true,
}: {
  text: string;
  error?: boolean;
  announce?: boolean;
}) {
  return (
    <p
      className={`status ${error ? "error" : ""}`}
      role={error ? "alert" : announce ? "status" : undefined}
    >
      <span aria-hidden="true" className="dot" />
      {text}
    </p>
  );
}
