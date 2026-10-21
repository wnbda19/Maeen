import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { SOUND_CLASSES } from "./events";
it("all enabled alert labels really exist in the shipped model vocabulary", () => {
  const labels = new Set(
    readFileSync(
      new URL("../../../../audio-models/labels.txt", import.meta.url),
      "utf8",
    )
      .trim()
      .split(/\r?\n/),
  );
  expect(labels.size).toBe(521);
  for (const kind of SOUND_CLASSES)
    for (const label of kind.labels)
      expect(labels.has(label), label).toBe(true);
});
it("capture mixes stereo to mono and creates overlapping native-rate windows", () => {
  const clips: Float32Array[] = [];
  let Constructor: any;
  runInNewContext(
    readFileSync(
      new URL("../../../public/audio-capture.js", import.meta.url),
      "utf8",
    ),
    {
      sampleRate: 48000,
      Float32Array,
      AudioWorkletProcessor: class {
        port = { postMessage: (clip: Float32Array) => clips.push(clip) };
      },
      registerProcessor: (_name: string, value: any) => {
        Constructor = value;
      },
    },
  );
  const processor = new Constructor();
  const left = new Float32Array(128).fill(0.8),
    right = new Float32Array(128).fill(0.2);
  for (let i = 0; i < 365; i++) processor.process([[left, right]]);
  expect(clips).toHaveLength(0);
  processor.process([[left, right]]);
  expect(clips[0].length).toBe(46800);
  expect(clips[0][100]).toBeCloseTo(0.5);
  for (let i = 0; i < 180; i++) processor.process([[left, right]]);
  expect(clips).toHaveLength(2);
  expect(processor.length).toBeLessThan(46800);
});
