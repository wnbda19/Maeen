import copy
import hashlib
import tempfile
import unittest
from pathlib import Path

from maeen_data.dataset import ingest, validate_partitions
from maeen_data.metrics import classification_metrics


class DatasetTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.splits = {"train": ["S001"], "validation": ["S002"], "test": ["S003"]}
        self.consents = [{"signerId": f"S00{i}", "consentRef": f"C{i}", "training": True,
                          "modelDistribution": True, "withdrawn": False} for i in range(1, 4)]
        self.rows = []
        for i in range(1, 4):
            name = f"raw/S00{i}/C01/W001/S00{i}_W001_C01_R01_T01.mp4"
            file = self.root / name
            file.parent.mkdir(parents=True)
            file.write_bytes(f"unit fixture {i}".encode())  # Not a video or training sample.
            self.rows.append({"file": name, "clipId": file.stem, "signerId": f"S00{i}",
                              "wordId": "W001", "sessionId": "C01", "repetition": 1, "take": 1,
                              "consentRef": f"C{i}", "captureType": "real-camera", "mirrored": False,
                              "qc": {"accepted": True, "languageReviewer": "Q01", "technicalReviewer": "Q02"}})

    def tearDown(self):
        self.temp.cleanup()

    def run_ingest(self, rows=None, consents=None):
        return ingest(self.root, rows or self.rows, consents or self.consents, self.splits, ["W001"])

    def test_assigns_only_signer_disjoint_partitions_and_hashes(self):
        result = self.run_ingest()
        self.assertEqual([r["split"] for r in result], ["train", "validation", "test"])
        self.assertEqual(result[0]["sha256"], hashlib.sha256(b"unit fixture 1").hexdigest())

    def test_rejects_withdrawn_or_missing_training_distribution_consent(self):
        for key, value in [("withdrawn", True), ("training", False), ("modelDistribution", False)]:
            consents = copy.deepcopy(self.consents)
            consents[0][key] = value
            with self.assertRaises(ValueError):
                self.run_ingest(consents=consents)

    def test_rejects_duplicate_bytes_across_signers(self):
        (self.root / self.rows[1]["file"]).write_bytes(b"unit fixture 1")
        with self.assertRaises(ValueError):
            self.run_ingest()

    def test_rejects_path_traversal_and_symlink_escape(self):
        rows = copy.deepcopy(self.rows)
        rows[0]["file"] = "../outside.mp4"
        with self.assertRaises(ValueError):
            self.run_ingest(rows=rows)

    def test_rejects_unknown_labels_synthetic_capture_mirroring_and_unreviewed_clips(self):
        for key, value in [("wordId", "invented"), ("captureType", "synthetic"), ("mirrored", True), ("qc", {"accepted": False})]:
            rows = copy.deepcopy(self.rows)
            rows[0][key] = value
            with self.assertRaises(ValueError):
                self.run_ingest(rows=rows)

    def test_rejects_overlapping_signers_empty_partitions_or_missing_class_coverage(self):
        result = self.run_ingest()
        with self.assertRaises(ValueError):
            validate_partitions(result, {"train": ["S001"], "validation": ["S001"], "test": ["S003"]}, ["W001"])
        with self.assertRaises(ValueError):
            validate_partitions(result[:2], self.splits, ["W001"])
        with self.assertRaises(ValueError):
            validate_partitions(result, self.splits, ["W001", "W002"])


class MetricsTests(unittest.TestCase):
    def test_rejection_uses_score_and_margin_without_forcing_a_word(self):
        from maeen_data.calibrate import reject_probabilities
        result = reject_probabilities([[0.9,0.05,0.05],[0.45,0.4,0.15]], ["W001","N000","N001"], 0.8, 0.15)
        self.assertEqual(result, [0,2])

    def test_rejection_refuses_nan_or_non_probability_outputs(self):
        from maeen_data.calibrate import reject_probabilities
        for values in [[[float('nan'),0,0]], [[0.8,0.8,0.1]], [[1.2,-0.1,-0.1]]]:
            with self.assertRaises(ValueError):
                reject_probabilities(values,["W001","N000","N001"],0.8,0.15)

    def test_confusion_and_per_class_metrics_have_known_values(self):
        metrics = classification_metrics([0, 0, 1, 1], [0, 1, 1, 1], ["a", "b"])
        self.assertEqual(metrics["confusionMatrix"], [[1, 1], [0, 2]])
        self.assertEqual(metrics["accuracy"], 0.75)
        self.assertAlmostEqual(metrics["macroF1"], (2 / 3 + 0.8) / 2)
        self.assertEqual(metrics["perClass"][0]["recall"], 0.5)

    def test_empty_or_invalid_results_cannot_be_reported_as_accuracy(self):
        for truth, predicted in [([], []), ([0], []), ([3], [0])]:
            with self.assertRaises(ValueError):
                classification_metrics(truth, predicted, ["a", "b"])


if __name__ == "__main__":
    unittest.main()
