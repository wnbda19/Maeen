/** Contract only. No implementation, weights or vocabulary currently exist.
 * A future adapter must be validated before any UI can expose predictions.
 * Coordinates, timestamps and frame window semantics must be declared by that model.
 */
export type Landmark3D = Readonly<{
  x: number;
  y: number;
  z: number;
  visibility?: number;
}>;
export type TemporalSignFrame = Readonly<{
  timestampMs: number;
  imageSize?: Readonly<{width:number;height:number}>;
  hands: ReadonlyArray<
    Readonly<{
      handedness: "left" | "right" | "unknown";
      landmarks: ReadonlyArray<Landmark3D>;
    }>
  >;
  upperBody: ReadonlyArray<Landmark3D>;
  face: ReadonlyArray<Landmark3D>;
}>;
export interface TemporalWordModel {
  readonly id: string;
  readonly vocabulary: readonly string[];
  readonly frameWindowMs: number;
  readonly coordinateSystem: string;
  readonly requiredLandmarks: readonly ("both-hands" | "upper-body" | "face")[];
  /** Sequential frames preserve movement over time. null means no accepted word. */
  recognize(
    frames: readonly TemporalSignFrame[],
    signal: AbortSignal,
  ): Promise<Readonly<{
    word: string;
    score?: number;
    scoreMeaning?: string;
  }> | null>;
  reset(): void;
  dispose(): void;
}
