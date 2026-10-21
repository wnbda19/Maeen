// PCM stays in memory and is sent only to MAEEN's local model worker.
class MaeenCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.frames = [];
    this.length = 0;
    this.window = Math.ceil(sampleRate * 0.975);
    this.hop = Math.round(sampleRate * 0.48);
  }
  process(inputs) {
    const channels = inputs[0];
    if (!channels?.length) return true;
    const mono = new Float32Array(channels[0].length);
    for (const channel of channels)
      for (let i = 0; i < mono.length; i++)
        mono[i] += channel[i] / channels.length;
    this.frames.push(mono);
    this.length += mono.length;
    if (this.length >= this.window) {
      const all = new Float32Array(this.length);
      let at = 0;
      for (const f of this.frames) {
        all.set(f, at);
        at += f.length;
      }
      const clip = all.slice(0, this.window);
      this.port.postMessage(clip, [clip.buffer]);
      const rest = all.slice(this.hop);
      this.frames = [rest];
      this.length = rest.length;
    }
    return true;
  }
}
registerProcessor("maeen-capture", MaeenCapture);
