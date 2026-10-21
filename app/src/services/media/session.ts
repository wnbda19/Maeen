export class MediaSession {
  private generation = 0;
  private stream: MediaStream | null = null;
  constructor(
    private acquire = (constraints: MediaStreamConstraints) => {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error("Media capture unavailable");
      return navigator.mediaDevices.getUserMedia(constraints);
    },
  ) {}
  async start(
    constraints: MediaStreamConstraints,
  ): Promise<MediaStream | null> {
    this.stop();
    const token = this.generation;
    const stream = await this.acquire(constraints);
    if (token !== this.generation) {
      stream.getTracks().forEach((track) => track.stop());
      return null;
    }
    this.stream = stream;
    return stream;
  }
  stop() {
    this.generation++;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}
