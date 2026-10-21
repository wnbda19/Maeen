import { expect, it } from "vitest";
import { WordPolicy, WordHistory } from "./word-policy";
const vocab = ["W001", "W002", "N000", "N001"];
it("requires temporally separated evidence and never forces unknown/no-hand input into a word", () => {
  const policy = new WordPolicy(vocab, {
    threshold: 0.8,
    margin: 0.15,
    minWindows: 3,
    minIntervalMs: 100,
    releaseMs: 400,
  });
  expect(
    policy.accept({ timeMs: 0, hasHands: false, probabilities: null }).state,
  ).toBe("no-sign");
  expect(
    policy.accept({
      timeMs: 100,
      hasHands: true,
      probabilities: [0.4, 0.35, 0.1, 0.15],
    }).state,
  ).toBe("unknown");
  expect(
    policy.accept({
      timeMs: 200,
      hasHands: true,
      probabilities: [0.9, 0.04, 0.03, 0.03],
    }).emitted,
  ).toBeNull();
  expect(
    policy.accept({
      timeMs: 300,
      hasHands: true,
      probabilities: [0.9, 0.04, 0.03, 0.03],
    }).emitted,
  ).toBeNull();
  const result = policy.accept({
    timeMs: 400,
    hasHands: true,
    probabilities: [0.9, 0.04, 0.03, 0.03],
  });
  expect(result.state).toBe("recognized");
  expect(result.emitted).toBe("W001");
  expect(
    policy.accept({
      timeMs: 500,
      hasHands: true,
      probabilities: [0.9, 0.04, 0.03, 0.03],
    }).emitted,
  ).toBeNull();
});
it("rejects malformed outputs, honors unknown class and resets history separately from the filter", () => {
  const policy = new WordPolicy(vocab);
  for (const probabilities of [
    [NaN, 0, 0, 0],
    [2, 0, 0, 0],
    [0.5, 0.5],
    [0.8, 0.8, 0.1, 0.1],
  ])
    expect(() =>
      policy.accept({ timeMs: 0, hasHands: true, probabilities }),
    ).toThrow();
  expect(
    policy.accept({
      timeMs: 1,
      hasHands: true,
      probabilities: [0.01, 0.01, 0.01, 0.97],
    }).state,
  ).toBe("unknown");
  const history = new WordHistory(vocab);
  expect(history.entries).toEqual([]);
  history.add("W001", 10);
  expect(history.entries).toHaveLength(1);
  expect(() => history.add("invented", 20)).toThrow();
  expect(() => history.add("N001", 20)).toThrow();
  history.reset();
  expect(history.entries).toEqual([]);
  policy.reset();
});
it("does not count a dropped stream interval as continuous stable evidence", () => {
  const policy = new WordPolicy(vocab);
  const observe = (timeMs: number) =>
    policy.accept({
      timeMs,
      hasHands: true,
      probabilities: [0.9, 0.04, 0.03, 0.03],
    });
  observe(0);
  observe(100);
  expect(observe(2000).emitted).toBeNull();
  expect(observe(2100).emitted).toBeNull();
  expect(observe(2200).emitted).toBe("W001");
});
