/** Digital signal level, NOT calibrated sound-pressure level (dB SPL). */
export function dbfs(samples: Float32Array): number {
  if (!samples.length) return -100;
  let sum = 0;
  for (const x of samples) sum += x * x;
  return Math.max(
    -100,
    Math.min(0, 20 * Math.log10(Math.sqrt(sum / samples.length))),
  );
}
