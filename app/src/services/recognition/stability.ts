import type { Prediction } from "./forest";
export class Stabilizer {
  private candidate = "";
  private frames = 0;
  private last = "";
  private missing = 0;
  /** Current display candidate; independent of repeated-letter append rearming. */
  get current(): string {
    return this.frames >= 12 ? this.candidate : "";
  }
  accept(p: Prediction | null): string | null {
    if (
      !p ||
      !Number.isFinite(p.score) ||
      p.score < 0.55 ||
      p.score > 1 ||
      !p.label
    ) {
      this.candidate = "";
      this.frames = 0;
      // Uncertainty is not a deliberate hand withdrawal: do not repeat a letter
      // just because its vote share fluctuates below threshold.
      this.missing = p === null ? this.missing + 1 : 0;
      if (this.missing >= 8) this.last = "";
      return null;
    }
    this.missing = 0;
    if (p.label === this.candidate) this.frames++;
    else {
      this.candidate = p.label;
      this.frames = 1;
    }
    if (this.frames >= 12 && this.last !== p.label) {
      this.last = p.label;
      return p.label;
    }
    return null;
  }
}
