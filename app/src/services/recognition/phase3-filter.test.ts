import { expect, it } from "vitest";
import { Stabilizer } from "./stability";
it("does not accept NaN, infinity or scores outside a vote fraction", () => {
  for (const score of [NaN, Infinity, 1.1, -1]) {
    const s = new Stabilizer();
    for (let i = 0; i < 20; i++)
      expect(s.accept({ label: "ب", score })).toBeNull();
    expect(s.current).toBe("");
  }
});
it("does not rearm duplicate letters merely because a visible hand becomes uncertain", () => {
  const s = new Stabilizer();
  for (let i = 0; i < 12; i++) s.accept({ label: "ب", score: 0.8 });
  for (let i = 0; i < 12; i++) s.accept({ label: "ب", score: 0.1 });
  for (let i = 0; i < 20; i++)
    expect(s.accept({ label: "ب", score: 0.8 })).toBeNull();
  for (let i = 0; i < 8; i++) s.accept(null);
  let emitted: string | null = null;
  for (let i = 0; i < 12; i++) emitted = s.accept({ label: "ب", score: 0.8 });
  expect(emitted).toBe("ب");
});
