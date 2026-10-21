import tempfile
import unittest
from pathlib import Path

import numpy as np
import torch

from maeen_data.models import make_model
from maeen_data.export import export_model


class ArchitectureTests(unittest.TestCase):
    def test_four_small_architectures_accept_the_real_feature_contract(self):
        for architecture in ("tcn", "gru", "bilstm", "stgcn"):
            with self.subTest(architecture=architecture):
                model = make_model(architecture, 17).eval()
                # Structural probe only. No fit, optimizer step or model artifact.
                with torch.no_grad():
                    result = model(torch.zeros(2, 32, 268))
                self.assertEqual(tuple(result.shape), (2, 17))
                self.assertTrue(torch.isfinite(result).all())
                self.assertLess(sum(p.numel() for p in model.parameters()), 500_000)

    def test_rejects_unknown_architecture(self):
        with self.assertRaises(ValueError):
            make_model("invented", 17)

    def test_all_exports_match_python_for_untrained_shape_probes(self):
        for architecture in ("tcn", "gru", "bilstm", "stgcn"):
            with self.subTest(architecture=architecture), tempfile.TemporaryDirectory() as folder:
                model = make_model(architecture, 17).eval()
                probe = np.zeros((1, 32, 268), dtype=np.float32)
                report = export_model(model, Path(folder) / "untrained-unit-probe.onnx", probe)
                self.assertLess(report["maximumAbsoluteDifference"], 1e-5)
                self.assertEqual(report["shape"], [1, 17])
                self.assertGreater(report["bytes"], 0)


if __name__ == "__main__":
    unittest.main()
