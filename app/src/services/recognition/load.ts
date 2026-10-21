import { parseForest } from "./forest";
export async function loadForest(signal: AbortSignal) {
  const base = import.meta.env.BASE_URL;
  const [binary, meta] = await Promise.all([
    fetch(`${base}models/arsl-forest.bin`, { signal }),
    fetch(`${base}models/arsl-labels.json`, { signal }),
  ]);
  if (!binary.ok || !meta.ok) throw new Error("Model unavailable");
  const labels = await meta.json();
  const model = parseForest(await binary.arrayBuffer(), labels.labels);
  if (
    labels.nFeatures !== model.nFeatures ||
    labels.nTrees !== model.trees.length ||
    labels.coordMode !== model.coordMode
  )
    throw new Error("Model metadata mismatch");
  return model;
}
