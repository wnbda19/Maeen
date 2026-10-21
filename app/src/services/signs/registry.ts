import arslLabels from "../../../../models/arsl-labels.json";
export type SignLanguageId = "arsl" | "asl" | "ksl";
export type SignLanguage = {
  id: SignLanguageId;
  displayName: string;
  direction: "rtl" | "ltr";
  textLanguage: string;
  modelType: "legacy-forest" | "landmark-mlp-v1" | "unavailable";
  modelUrl: string | null;
  assets: readonly string[];
  labelManifest: string | null;
  preprocessing: { id: string; landmarks: number; temporal: boolean } | null;
  letters: { supported: boolean; status: string };
  words: { supported: boolean; status: string };
  vocabulary: { letters: readonly string[]; words: readonly string[] };
  evaluation: {
    status: string;
    accuracy: number | null;
    macroF1: number | null;
    signerIndependent: boolean;
    signers: number | null;
  };
  version: string | null;
  attribution: string;
  license: {
    id: string;
    source: string | null;
    trainingData?: string;
    evaluationData?: string;
    weights?: string;
  };
};
export const signLanguages: readonly SignLanguage[] = [
  {
    id: "arsl",
    displayName: "العربية — ArSL",
    direction: "rtl",
    textLanguage: "ar",
    modelType: "legacy-forest",
    modelUrl: "models/arsl-forest.bin",
    assets: [
      "models/arsl-forest.bin",
      "models/arsl-labels.json",
      "models/hand_landmarker.task",
    ],
    labelManifest: "models/arsl-labels.json",
    preprocessing: {
      id: "legacy-" + arslLabels.coordMode,
      landmarks: 21,
      temporal: false,
    },
    letters: { supported: true, status: "legacy-accuracy-unverified" },
    words: { supported: false, status: "dataset-required" },
    vocabulary: { letters: arslLabels.labels, words: [] },
    evaluation: {
      status: "accuracy-unverified",
      accuracy: null,
      macroF1: null,
      signerIndependent: false,
      signers: null,
    },
    version: "legacy-forest-v1",
    attribution:
      "Preserved original MAEEN Arabic alphabet classifier; training provenance and accuracy remain unverified.",
    license: { id: "legacy-unverified", source: null },
  },
  {
    id: "asl",
    displayName: "ASL — American Sign Language",
    direction: "ltr",
    textLanguage: "en",
    modelType: "landmark-mlp-v1",
    modelUrl: "sign-models/asl-static/model.json",
    assets: [
      "sign-models/asl-static/model.json",
      "sign-models/asl-static/labels.json",
      "models/hand_landmarker.task",
    ],
    labelManifest: "sign-models/asl-static/labels.json",
    preprocessing: {
      id: "wrist-middle-mcp-handedness-v1",
      landmarks: 21,
      temporal: false,
    },
    letters: { supported: true, status: "experimental-static-24" },
    words: { supported: false, status: "model-unavailable" },
    vocabulary: { letters: Array.from("ABCDEFGHIKLMNOPQRSTUVWXY"), words: [] },
    evaluation: {
      status: "cross-source-images-not-signer-independent",
      accuracy: 0.6310395314787701,
      macroF1: 0.584423026666021,
      signerIndependent: false,
      signers: null,
    },
    version: "1.0.0-experimental",
    attribution:
      "MAEEN MLP trained on Ayush Thakur CC0 ASL Dataset; separate Dan Rasband CC0 test images. J/Z excluded.",
    license: {
      id: "MAEEN-original",
      trainingData: "CC0-1.0",
      evaluationData: "CC0-1.0",
      weights: "Original MAEEN project asset; governed by project licensing",
      source: "https://www.kaggle.com/datasets/ayuraj/asl-dataset",
    },
  },
  {
    id: "ksl",
    displayName: "한국 수어 — KSL",
    direction: "ltr",
    textLanguage: "ko",
    modelType: "unavailable",
    modelUrl: null,
    assets: [],
    labelManifest: null,
    preprocessing: null,
    letters: { supported: false, status: "research-model-unavailable" },
    words: { supported: false, status: "research-model-unavailable" },
    vocabulary: { letters: [], words: [] },
    evaluation: {
      status: "not-implemented",
      accuracy: null,
      macroF1: null,
      signerIndependent: false,
      signers: null,
    },
    version: null,
    attribution:
      "Korean Sign Language research only; no suitable RGB-webcam model with confirmed deployment rights integrated.",
    license: { id: "not-applicable-no-model", source: null },
  },
];
export function getSignLanguage(id: string): SignLanguage {
  const language = signLanguages.find((l) => l.id === id);
  if (!language) throw Error("Unknown sign language");
  return language;
}
export type SignModel = {
  predict: (
    hand: readonly { x: number; y: number; z: number }[] | undefined,
    handedness: string,
  ) => import("../recognition/forest").Prediction | null;
  dispose: () => void;
};
export async function loadSignModel(
  id: SignLanguageId,
  signal: AbortSignal,
): Promise<SignModel> {
  const spec = getSignLanguage(id);
  if (!spec.letters.supported || spec.modelType === "unavailable")
    throw Error("Sign model unavailable");
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  if (id === "arsl") {
    const [{ loadForest }, { predict }] = await Promise.all([
      import("../recognition/load"),
      import("../recognition/forest"),
    ]);
    const forest = await loadForest(signal);
    return {
      predict: (hand) => {
        const origin =
          forest.coordMode === "raw" ? { x: 0, y: 0, z: 0 } : hand?.[0];
        return hand?.length === 21 && origin
          ? predict(
              forest,
              new Float32Array(
                hand.flatMap((p) => [
                  p.x - origin.x,
                  p.y - origin.y,
                  p.z - origin.z,
                ]),
              ),
            )
          : null;
      },
      dispose: () => {},
    };
  }
  const { parseAslModel, inferAsl, normalizeAsl, AslSmoother } =
    await import("./asl");
  const base = import.meta.env.BASE_URL;
  const [weights, labels] = await Promise.all([
    fetch(base + spec.modelUrl!, { signal }),
    fetch(base + spec.labelManifest!, { signal }),
  ]);
  if (!weights.ok || !labels.ok) throw Error("ASL model unavailable");
  const model = parseAslModel(await weights.json()),
    manifest = await labels.json();
  if (
    manifest.version !== spec.version ||
    JSON.stringify(manifest.labels) !== JSON.stringify(model.labels)
  )
    throw Error("ASL label mismatch");
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  const smoother = new AslSmoother();
  return {
    predict: (hand, handedness) => {
      if (!hand) return smoother.accept(null);
      const features = normalizeAsl(hand, handedness);
      return features
        ? smoother.accept(inferAsl(model, features).scores)
        : smoother.accept([NaN]);
    },
    dispose: () => smoother.reset(),
  };
}
