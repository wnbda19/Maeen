import { describe, it, expect, vi } from "vitest";
import { SoundFilter, SOUND_CLASSES, notifySound } from "./events";
describe("sound alert policy", () => {
  it("requires consecutive confident windows and suppresses duplicates", () => {
    const f = new SoundFilter();
    const scores = [{ categoryName: "Bark", score: 0.9 }];
    expect(f.push(scores, 0)).toBeNull();
    expect(f.push(scores, 480)?.kind.id).toBe("dog");
    expect(f.push(scores, 20000)).toBeNull();
    f.push([], 21000);
    f.push([], 21500);
    f.push([], 22000);
    expect(f.push(scores, 22500)).toBeNull();
    expect(f.push(scores, 23000)?.kind.id).toBe("dog");
  });
  it("rejects low, malformed and disabled predictions", () => {
    const f = new SoundFilter();
    for (const score of [0.2, NaN, Infinity, -1, 2]) {
      expect(f.push([{ categoryName: "Bark", score }], 0)).toBeNull();
    }
    f.configure(0.8, []);
    expect(f.push([{ categoryName: "Bark", score: 1 }], 500)).toBeNull();
    expect(f.push([{ categoryName: "Bark", score: 1 }], 1000)).toBeNull();
  });
  it("resets stability on gaps and configuration changes", () => {
    const f = new SoundFilter();
    const p = [{ categoryName: "Siren", score: 0.9 }];
    f.push(p, 0);
    expect(f.push(p, 3000)).toBeNull();
    f.configure(
      0.95,
      SOUND_CLASSES.map((c) => c.id),
    );
    expect(f.push(p, 3500)).toBeNull();
  });
  it("does not sum overlapping parent and child class probabilities", () => {
    const f = new SoundFilter();
    const p = [
      { categoryName: "Siren", score: 0.4 },
      { categoryName: "Ambulance (siren)", score: 0.4 },
    ];
    f.push(p, 0);
    expect(f.push(p, 480)).toBeNull();
  });
  it("notifications are opt-in, permission-gated and failure-safe", () => {
    const send = vi.fn(),
      vibrate = vi.fn();
    notifySound("Bark", false, false, { permission: "granted", send, vibrate });
    expect(send).not.toHaveBeenCalled();
    notifySound("Bark", true, true, { permission: "denied", send, vibrate });
    expect(send).not.toHaveBeenCalled();
    expect(vibrate).toHaveBeenCalledOnce();
    notifySound("Bark", true, false, { permission: "granted", send, vibrate });
    expect(send).toHaveBeenCalledOnce();
    expect(() =>
      notifySound("Bark", true, true, {
        permission: "granted",
        send: () => {
          throw Error();
        },
        vibrate: () => {
          throw Error();
        },
      }),
    ).not.toThrow();
  });
});
