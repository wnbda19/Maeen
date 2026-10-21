import type { SoundScore } from "./events";
export class AudioModel {
  private worker: Worker | null = null;
  private busy = false;
  private ready = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private rejectLoad: ((reason: Error) => void) | null = null;
  onResult: (scores: SoundScore[], ms: number) => void = () => {};
  onFailure: () => void = () => {};
  constructor(
    private make = () =>
      new Worker(new URL("./audio.worker.ts", import.meta.url)),
  ) {}
  load(base: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.rejectLoad = reject;
      try {
        const worker = this.make();
        this.worker = worker;
        const fail = (message: string) => {
          this.busy = false;
          if (this.timer) clearTimeout(this.timer);
          if (!this.ready) reject(new Error(message));
          else this.onFailure();
        };
        worker.onerror = () => fail("Audio worker failed");
        worker.onmessage = ({ data }) => {
          if (data.type === "ready") {
            this.ready = true;
            this.rejectLoad = null;
            if (this.timer) clearTimeout(this.timer);
            resolve(data.loadMs);
          } else if (data.type === "error") fail(data.message);
          else if (data.type === "result") {
            this.busy = false;
            if (this.timer) clearTimeout(this.timer);
            this.onResult(data.scores, data.inferenceMs);
          }
        };
        this.timer = setTimeout(
          () => fail("Audio model loading timed out"),
          30000,
        );
        worker.postMessage({ type: "load", base });
      } catch (error) {
        reject(error);
      }
    });
  }
  infer(samples: Float32Array, sampleRate: number) {
    if (
      !this.ready ||
      this.busy ||
      !this.worker ||
      !Number.isFinite(sampleRate) ||
      sampleRate < 8000 ||
      samples.length < sampleRate * 0.95 ||
      samples.some((v) => !Number.isFinite(v))
    )
      return;
    this.busy = true;
    this.timer = setTimeout(() => this.onFailure(), 10000);
    this.worker.postMessage({ type: "infer", samples, sampleRate }, [
      samples.buffer,
    ]);
  }
  close() {
    if (this.timer) clearTimeout(this.timer);
    this.rejectLoad?.(new Error("Audio model closed"));
    this.rejectLoad = null;
    this.worker?.terminate();
    this.worker = null;
    this.ready = false;
    this.busy = false;
  }
}
