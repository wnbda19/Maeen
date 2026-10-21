"""Temporary geometry probes validate plumbing; none is ever fitted by a model."""
import json
import subprocess
import tempfile
import unittest
from pathlib import Path

import numpy as np


class SharedFeatureTests(unittest.TestCase):
    def test_node_command_writes_the_same_browser_feature_contract(self):
        project = Path(__file__).resolve().parents[2]
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / "landmarks").mkdir()
            point = lambda x, y: {"x": x, "y": y, "z": 0}
            frames = [{"timestampMs": index * 100, "imageSize":{"width":1280,"height":720},
                       "hands":[{"handedness":"right","landmarks":[point(0.5+index/100,0.5) for _ in range(21)]}],
                       "upperBody":[point(0.3,0.4),point(0.7,0.4)]+[point(0.5,0.6) for _ in range(6)],
                       "face":[point(0.5,0.2) for _ in range(17)]} for index in range(8)]
            row = {"clipId":"unit-geometry-probe","sha256":"a"*64,"source":"first-party",
                   "captureType":"real-camera","qc":{"accepted":True},"wordId":"W001"}
            # Metadata fixture exercises the preparer only; no recording or fit.
            (root / "input.json").write_text(json.dumps([row]))
            (root / "landmarks/unit-geometry-probe.json").write_text(json.dumps({"schemaVersion":"maeen-landmarks-v1","sourceSha256":"a"*64,"frames":frames,"taskHashes":{},"extractor":"unit-fixture"}))
            result = subprocess.run(["node",str(project/"app/scripts/prepare-word-features.mjs"),str(root/"input.json"),str(root),str(root/"index.json")],capture_output=True,text=True,encoding="utf-8",timeout=30)
            self.assertEqual(result.returncode,0,result.stderr)
            index = json.loads((root/"index.json").read_text())
            self.assertEqual(index[0]["shape"],[1,32,268])
            values = np.fromfile(root/index[0]["featureFile"],dtype="<f4").reshape(32,268)
            self.assertTrue(np.isfinite(values).all())
            self.assertTrue(np.isin(values[:,3::4],[0,1]).all())
            self.assertNotEqual(float(values[0,84]),float(values[-1,84]))


if __name__ == "__main__":
    unittest.main()
