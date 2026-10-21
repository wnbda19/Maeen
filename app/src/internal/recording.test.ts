import { it, expect } from "vitest";
import {
  validateDraft,
  clipName,
  collectionProgress,
  profiles,
} from "./recording";
const draft = {
  profileId: "reference25",
  signerId: "S001",
  sessionId: "C01",
  wordId: "W101",
  repetition: 1,
  take: 1,
  consent: true,
  consentRef: "C-S001-v2",
};
it("requires real consent, known IDs and bounded duration", () => {
  expect(() => validateDraft({ ...draft, consent: false }, 4)).toThrow();
  expect(() => validateDraft({ ...draft, signerId: "name" }, 4)).toThrow();
  expect(() => validateDraft({ ...draft, wordId: "W001" }, 4)).toThrow();
  for (const seconds of [NaN, 2, 11])
    expect(() => validateDraft(draft, seconds)).toThrow();
  expect(() => validateDraft(draft, 4)).not.toThrow();
  expect(clipName(draft, "webm")).toBe("S001_W101_C01_R01_T01.webm");
});
it("counts unique recorded slots, separates QC and never counts retakes twice", () => {
  const rows = [
    { ...draft, qc: { accepted: false } },
    { ...draft, take: 2, qc: { accepted: true } },
  ];
  const progress = collectionProgress(rows, "reference25");
  expect(progress.recorded).toBe(1);
  expect(progress.accepted).toBe(1);
  expect(progress.remaining).toBe(5624);
  expect(collectionProgress([], "mvp15").remaining).toBe(2700);
});
it("freezes complete disjoint profiles and official mappings", () => {
  for (const p of profiles.profiles) {
    expect(new Set(Object.values(p.splits).flat()).size).toBe(p.signers.length);
    expect(p.wordIds.length * p.signers.length * p.repetitions).toBe(
      p.positiveTarget,
    );
  }
  expect(profiles.words).toHaveLength(25);
  expect(new Set(profiles.words.map((w) => w.officialTermId)).size).toBe(25);
});
