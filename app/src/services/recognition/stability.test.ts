import { it, expect } from "vitest";
import { Stabilizer } from "./stability";
it("requires 12 consecutive acceptable frames and rearms after eight missing frames", () => {
  const s = new Stabilizer();
  const p = { label: "ب", score: 0.8 };
  for (let i = 0; i < 11; i++) expect(s.accept(p)).toBeNull();
  expect(s.accept(p)).toBe("ب");
  expect(s.accept(p)).toBeNull();
  for (let i = 0; i < 8; i++) s.accept(null);
  for (let i = 0; i < 11; i++) s.accept(p);
  expect(s.accept(p)).toBe("ب");
});
it("does not count low-score frames toward stability", () => {
  const s = new Stabilizer();
  for (let i = 0; i < 30; i++)
    expect(s.accept({ label: "ب", score: 0.1 })).toBeNull();
  expect(s.accept({ label: "ب", score: 0.9 })).toBeNull();
});
it("only exposes a display letter after twelve consistent frames and clears it on uncertainty", () => {
  const stable = new Stabilizer();
  for (let i = 0; i < 11; i++) {
    stable.accept({ label: "ب", score: 0.8 });
    expect(stable.current).toBe("");
  }
  stable.accept({ label: "ب", score: 0.8 });
  expect(stable.current).toBe("ب");
  stable.accept({ label: "ت", score: 0.8 });
  expect(stable.current).toBe("");
  stable.accept(null);
  expect(stable.current).toBe("");
});
