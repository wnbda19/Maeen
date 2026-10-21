export type Prediction = { label: string; score: number };
type Node = {
  feature: number;
  classId: number;
  threshold: number;
  left: number;
  right: number;
};
export type Forest = {
  nFeatures: number;
  labels: string[];
  coordMode: "raw" | "wrist-relative";
  trees: Node[][];
};

export function parseForest(buffer: ArrayBuffer, labels: string[]): Forest {
  const fail = () => {
    throw new Error("Invalid ARSL model");
  };
  if (buffer.byteLength < 28) return fail();
  const v = new DataView(buffer);
  if (v.getUint32(0, false) !== 0x4152534c || v.getUint32(4, true) !== 1)
    return fail();
  const nFeatures = v.getUint32(8, true),
    nClasses = v.getUint32(12, true),
    count = v.getUint32(16, true),
    mode = v.getUint32(20, true);
  if (
    nFeatures !== 63 ||
    nClasses !== labels.length ||
    !nClasses ||
    !count ||
    count > 1000 ||
    mode > 1 ||
    labels.some((x) => typeof x !== "string" || !x)
  )
    return fail();
  const trees: Node[][] = [];
  let offset = 28;
  for (let t = 0; t < count; t++) {
    if (offset + 4 > buffer.byteLength) return fail();
    const size = v.getUint32(offset, true);
    offset += 4;
    if (!size || offset + size * 16 > buffer.byteLength) return fail();
    const tree: Node[] = [];
    for (let i = 0; i < size; i++, offset += 16) {
      const n = {
        feature: v.getInt16(offset, true),
        classId: v.getInt16(offset + 2, true),
        threshold: v.getFloat32(offset + 4, true),
        left: v.getInt32(offset + 8, true),
        right: v.getInt32(offset + 12, true),
      };
      if (n.left < 0 || n.feature < 0) {
        if (n.classId < 0 || n.classId >= nClasses) return fail();
      } else if (
        n.feature >= nFeatures ||
        !Number.isFinite(n.threshold) ||
        n.left >= size ||
        n.right < 0 ||
        n.right >= size
      )
        return fail();
      tree.push(n);
    }
    // Iterative DFS validates all reachable edges without recursive stack exhaustion.
    const state = new Uint8Array(size),
      stack: [number, boolean][] = [[0, false]];
    while (stack.length) {
      const [index, exit] = stack.pop()!;
      if (exit) {
        state[index] = 2;
        continue;
      }
      if (state[index] === 1) return fail();
      if (state[index] === 2) continue;
      state[index] = 1;
      stack.push([index, true]);
      const n = tree[index];
      if (n.feature >= 0 && n.left >= 0)
        stack.push([n.right, false], [n.left, false]);
    }
    if (state.some((s) => s !== 2)) return fail();
    trees.push(tree);
  }
  if (offset !== buffer.byteLength) return fail();
  return {
    nFeatures,
    labels: [...labels],
    coordMode: mode === 0 ? "raw" : "wrist-relative",
    trees,
  };
}

export function predict(model: Forest, values: ArrayLike<number>): Prediction {
  if (
    values.length !== model.nFeatures ||
    Array.from(values).some((x) => !Number.isFinite(x))
  )
    throw new Error("Invalid landmark vector");
  const votes = new Uint32Array(model.labels.length);
  for (const tree of model.trees) {
    let index = 0,
      finished = false;
    for (let step = 0; step < tree.length; step++) {
      const node = tree[index];
      if (!node) throw new Error("Invalid tree edge");
      if (node.feature < 0 || node.left < 0) {
        votes[node.classId]++;
        finished = true;
        break;
      }
      index = values[node.feature] <= node.threshold ? node.left : node.right;
    }
    if (!finished) throw new Error("Nonterminating tree");
  }
  let best = 0;
  for (let i = 1; i < votes.length; i++) if (votes[i] > votes[best]) best = i;
  return { label: model.labels[best], score: votes[best] / model.trees.length };
}
