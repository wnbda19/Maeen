/** Uncalibrated infrastructure defaults. Not connected to Word Mode without a trained model. */
type Options = {
  threshold: number;
  margin: number;
  minWindows: number;
  minIntervalMs: number;
  releaseMs: number;
  maxGapMs: number;
};
type Observation = {
  timeMs: number;
  hasHands: boolean;
  probabilities: readonly number[] | null;
};
export type WordDecision = {
  state: "no-sign" | "unknown" | "recognized";
  word: string | null;
  emitted: string | null;
  score: number | null;
};
export class WordPolicy {
  private lastTime = -1;
  private lastEvidence = -Infinity;
  private candidate = "";
  private count = 0;
  private lastWord = "";
  private releaseStart: number | null = null;
  private options: Options;
  constructor(
    private labels: readonly string[],
    options: Partial<Options> = {},
  ) {
    this.options = {
      threshold: 0.8,
      margin: 0.15,
      minWindows: 3,
      minIntervalMs: 100,
      releaseMs: 400,
      maxGapMs: 350,
      ...options,
    };
    if (
      labels.length < 3 ||
      new Set(labels).size !== labels.length ||
      !labels.includes("N000") ||
      !labels.includes("N001") ||
      !labels.every((x) => /^(W\d{3}|N00[01])$/.test(x))
    )
      throw new Error("Invalid vocabulary");
    const p = this.options;
    if (
      !Object.values(p).every(Number.isFinite) ||
      p.threshold <= 0 ||
      p.threshold > 1 ||
      p.margin < 0 ||
      p.margin > 1 ||
      !Number.isInteger(p.minWindows) ||
      p.minWindows < 2 ||
      p.minIntervalMs <= 0 ||
      p.releaseMs <= 0 ||
      p.maxGapMs < p.minIntervalMs
    )
      throw new Error("Invalid decision policy");
  }
  reset() {
    this.lastTime = -1;
    this.lastEvidence = -Infinity;
    this.candidate = "";
    this.count = 0;
    this.lastWord = "";
    this.releaseStart = null;
  }
  accept(o: Observation): WordDecision {
    const p = o.probabilities;
    if (!Number.isFinite(o.timeMs) || o.timeMs < 0 || o.timeMs <= this.lastTime)
      throw new Error("Non-monotonic observation");
    if (
      o.hasHands &&
      (!p ||
        p.length !== this.labels.length ||
        p.some((x) => !Number.isFinite(x) || x < 0 || x > 1) ||
        Math.abs(p.reduce((a, b) => a + b, 0) - 1) > 0.001)
    )
      throw new Error("Malformed model probabilities");
    if (
      this.lastTime >= 0 &&
      o.timeMs - this.lastTime > this.options.maxGapMs
    ) {
      this.candidate = "";
      this.count = 0;
      this.lastEvidence = -Infinity;
      this.releaseStart = null;
    }
    this.lastTime = o.timeMs;
    let best = 0,
      second = 0;
    if (p) {
      const ranked = p
        .map((value, index) => ({ value, index }))
        .sort((a, b) => b.value - a.value);
      best = ranked[0].index;
      second = ranked[1]?.value ?? 0;
    }
    const label = p ? this.labels[best] : null,
      score = p?.[best] ?? null;
    if (
      !o.hasHands ||
      (label === "N000" &&
        score! >= this.options.threshold &&
        score! - second >= this.options.margin)
    ) {
      this.candidate = "";
      this.count = 0;
      this.releaseStart ??= o.timeMs;
      if (o.timeMs - this.releaseStart >= this.options.releaseMs)
        this.lastWord = "";
      return { state: "no-sign", word: null, emitted: null, score };
    }
    this.releaseStart = null;
    if (
      !label ||
      label === "N001" ||
      score! < this.options.threshold ||
      score! - second < this.options.margin
    ) {
      this.candidate = "";
      this.count = 0;
      return { state: "unknown", word: null, emitted: null, score };
    }
    if (label !== this.candidate) {
      this.candidate = label;
      this.count = 0;
      this.lastEvidence = -Infinity;
    }
    if (o.timeMs - this.lastEvidence >= this.options.minIntervalMs) {
      this.count++;
      this.lastEvidence = o.timeMs;
    }
    if (this.count < this.options.minWindows)
      return { state: "unknown", word: null, emitted: null, score };
    const emitted = this.lastWord === label ? null : label;
    this.lastWord = label;
    return { state: "recognized", word: label, emitted, score };
  }
}
export class WordHistory {
  private items: { word: string; timeMs: number }[] = [];
  constructor(
    private labels: readonly string[],
    private limit = 100,
  ) {
    if (!Number.isInteger(limit) || limit < 1)
      throw new Error("Invalid history limit");
  }
  get entries() {
    return this.items.map((x) => ({ ...x }));
  }
  add(word: string, timeMs: number) {
    if (
      !this.labels.includes(word) ||
      !/^W\d{3}$/.test(word) ||
      !Number.isFinite(timeMs) ||
      timeMs < 0 ||
      (this.items.length && timeMs < this.items[this.items.length - 1].timeMs)
    )
      throw new Error("Invalid recognized event");
    this.items.push({ word, timeMs });
    this.items = this.items.slice(-this.limit);
  }
  reset() {
    this.items = [];
  }
}
