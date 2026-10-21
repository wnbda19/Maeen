import json
import tempfile
import unittest
from pathlib import Path

import cv2
import numpy as np

from maeen_data.dataset import sha256_file
from maeen_data.extract import extract_clip
from maeen_data.train import validate_training_ready, load_features


class PipelineTests(unittest.TestCase):
    def test_training_is_blocked_with_no_real_recordings(self):
        with self.assertRaisesRegex(ValueError, "Dataset collection required"):
            validate_training_ready([], {}, [], {})

    def test_training_is_blocked_without_linguistic_approval(self):
        with self.assertRaisesRegex(ValueError, "Deaf-led"):
            validate_training_ready([{}], {"linguisticReview": "pending"}, [], {})

    def test_incompatible_or_missing_features_fail_closed(self):
        with self.assertRaises(ValueError):
            load_features(Path.cwd(), [{"featureVersion": "wrong"}], ["W001"])
        with self.assertRaises(ValueError):
            load_features(Path.cwd(), [], ["W001"])

    def test_real_detector_and_decoder_on_temporary_blank_clip(self):
        """Engineering boot test only: this clip is never ingested or trained on."""
        tasks = Path(__file__).resolve().parents[1] / "assets"
        if not all((tasks / (name + "_landmarker.task")).exists() for name in ("hand", "pose", "face")):
            self.skipTest("Run setup_assets.py for detector startup verification")
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder) / "تجربة"
            root.mkdir()
            file = Path(folder) / "decoder-unit-probe.mp4"
            writer = cv2.VideoWriter(str(file), cv2.VideoWriter_fourcc(*"mp4v"), 30, (640, 480))
            self.assertTrue(writer.isOpened())
            for _ in range(12):
                writer.write(np.zeros((480, 640, 3), dtype=np.uint8))
            writer.release()
            file = file.replace(root / file.name)
            row = {"file": file.name, "clipId": "decoder-unit-probe", "sha256": sha256_file(file)}
            report = extract_clip(root, row, tasks)
            self.assertEqual(report["frames"], 12)
            result = json.loads((root / "landmarks/decoder-unit-probe.json").read_text())
            self.assertEqual(len(result["taskHashes"]), 3)
            self.assertTrue(all(frame["hands"] == [] for frame in result["frames"]))
            self.assertEqual(result["frames"][0]["imageSize"], {"width": 640, "height": 480})


if __name__ == "__main__":
    unittest.main()
