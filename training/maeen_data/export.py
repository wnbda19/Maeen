"""ONNX candidate export + numerical parity. This never publishes to app/public."""
import time
from pathlib import Path

import numpy as np
import torch


def export_model(model, path, probe):
    import onnx
    import onnxruntime as ort

    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    model = model.cpu().eval()
    sample = torch.from_numpy(np.asarray(probe, dtype=np.float32))
    if tuple(sample.shape) != (1, 32, 268):
        raise ValueError("Export requires a real preprocessed [1,32,268] reference clip")
    torch.onnx.export(model, sample, str(path), input_names=["frames"], output_names=["logits"],
                      opset_version=17, dynamo=False, external_data=False)
    onnx.checker.check_model(onnx.load(str(path)))
    session = ort.InferenceSession(str(path), providers=["CPUExecutionProvider"])
    with torch.no_grad():
        expected = model(sample).numpy()
    actual = session.run(None, {"frames": sample.numpy()})[0]
    difference = float(np.max(np.abs(expected - actual)))
    if not np.allclose(expected, actual, rtol=1e-4, atol=1e-5):
        raise ValueError("Export parity failed")
    for _ in range(10):
        session.run(None, {"frames": sample.numpy()})
    times = []
    for _ in range(100):
        start = time.perf_counter()
        session.run(None, {"frames": sample.numpy()})
        times.append((time.perf_counter() - start) * 1000)
    return {"maximumAbsoluteDifference": difference, "shape": list(actual.shape), "bytes": path.stat().st_size,
            "cpuRuntime": ort.__version__, "cpuP50Ms": float(np.percentile(times, 50)),
            "cpuP95Ms": float(np.percentile(times, 95)), "browserLatencyMs": None}
