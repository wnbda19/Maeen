import { it, expect, vi } from "vitest";
import { MediaSession } from "./session";
it("stops a late permission stream after cancellation", async () => {
  const stop = vi.fn();
  const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
  let resolve!: (s: MediaStream) => void;
  const session = new MediaSession(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  const pending = session.start({ video: true });
  session.stop();
  resolve(stream);
  expect(await pending).toBeNull();
  expect(stop).toHaveBeenCalledOnce();
});
it("releases the current stream on stop", async () => {
  const stop = vi.fn();
  const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
  const session = new MediaSession(async () => stream);
  expect(await session.start({ audio: true })).toBe(stream);
  session.stop();
  session.stop();
  expect(stop).toHaveBeenCalledOnce();
});
it("propagates permission denial without an active stream", async () => {
  const session = new MediaSession(async () => {
    throw new Error("denied");
  });
  await expect(session.start({ audio: true })).rejects.toThrow("denied");
  session.stop();
});
