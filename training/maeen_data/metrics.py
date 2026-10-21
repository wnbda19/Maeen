"""Explicit closed-set metrics; include negative classes to assess false accepts."""


def classification_metrics(truth, predicted, labels):
    if not labels or len(set(labels)) != len(labels) or not truth or len(truth) != len(predicted):
        raise ValueError("Nonempty aligned results and unique labels required")
    size = len(labels)
    matrix = [[0] * size for _ in labels]
    for actual, prediction in zip(truth, predicted):
        if type(actual) is not int or type(prediction) is not int or not 0 <= actual < size or not 0 <= prediction < size:
            raise ValueError("Class index outside vocabulary")
        matrix[actual][prediction] += 1
    per_class = []
    for i, label in enumerate(labels):
        tp = matrix[i][i]
        support = sum(matrix[i])
        total_predictions = sum(row[i] for row in matrix)
        precision = tp / total_predictions if total_predictions else 0
        recall = tp / support if support else 0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0
        per_class.append({"label": label, "support": support, "precision": precision,
                          "recall": recall, "f1": f1, "accuracy": tp / support if support else None})
    pairs = sorted([{"actual": labels[i], "predicted": labels[j], "count": matrix[i][j]}
                    for i in range(size) for j in range(size) if i != j and matrix[i][j]],
                   key=lambda item: -item["count"])
    return {"samples": len(truth), "labels": labels, "accuracy": sum(matrix[i][i] for i in range(size)) / len(truth),
            "macroPrecision": sum(row["precision"] for row in per_class) / size,
            "macroRecall": sum(row["recall"] for row in per_class) / size,
            "macroF1": sum(row["f1"] for row in per_class) / size,
            "perClass": per_class, "confusionMatrix": matrix, "commonConfusions": pairs}
