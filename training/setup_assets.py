"""Fetch official detector tasks locally; never publishes weights or signs data."""
import hashlib
import json
import shutil
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
URLS = {
    "pose": "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
    "face": "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
}


def setup():
    assets = ROOT / "assets"
    assets.mkdir(exist_ok=True)
    manifest = ROOT / "config/detector-assets.json"
    expected = json.loads(manifest.read_text(encoding="utf-8")) if manifest.exists() else {}
    if not (assets / "hand_landmarker.task").exists():
        shutil.copy2(ROOT.parent / "models/hand_landmarker.task", assets / "hand_landmarker.task")
    records = {}
    for name in ("hand", "pose", "face"):
        path = assets / (name + "_landmarker.task")
        if not path.exists():
            with urllib.request.urlopen(URLS[name], timeout=120) as response:
                data = response.read()
            if not 1_000_000 <= len(data) <= 50_000_000:
                raise ValueError("Unexpected detector download size")
            if name in expected and hashlib.sha256(data).hexdigest() != expected[name]["sha256"]:
                raise ValueError("Official task changed; review version and feature compatibility before accepting")
            path.write_bytes(data)
        if name in expected and hashlib.sha256(path.read_bytes()).hexdigest() != expected[name]["sha256"]:
            raise ValueError("Local detector hash differs from recorded setup")
        records[name] = {"source": URLS.get(name, "preserved project hand task"),
                         "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "bytes": path.stat().st_size,
                         "scope": "local detector for first-party feature extraction, not a word model"}
    (ROOT / "config/detector-assets.json").write_text(json.dumps(records, indent=2), encoding="utf-8")
    print("Prepared three local detector tasks; no dataset or word model downloaded.")


if __name__ == "__main__":
    setup()
