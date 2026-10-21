"""Real local video -> MediaPipe image-coordinate sequences. No inference labels."""
from pathlib import Path
import contextlib
import tempfile
import threading

from .dataset import safe_path, sha256_file, write_json

UPPER = (11, 12, 13, 14, 15, 16, 23, 24)
FACE = (1, 4, 13, 14, 33, 61, 70, 105, 107, 133, 152, 263, 291, 300, 334, 336, 362)
_NATIVE_LOCK = threading.RLock()


def point(p):
    value = {"x": p.x, "y": p.y, "z": p.z}
    if p.visibility is not None:
        value["visibility"] = p.visibility
    return value


def extract_clip(root, row, tasks):
    # Windows task bindings use narrow native paths for working directories and
    # model files. Python reads model bytes using Unicode-safe I/O instead.
    # Extraction is serial: chdir is process-wide, protected for this CLI.
    root, tasks = Path(root).resolve(), Path(tasks).resolve()
    with _NATIVE_LOCK, tempfile.TemporaryDirectory(prefix="maeen-native-") as scratch:
        if not str(scratch).isascii():
            raise ValueError("MediaPipe on Windows requires an ASCII temporary directory")
        with contextlib.chdir(scratch):
            return _extract_clip(root, row, tasks)


def _extract_clip(root, row, tasks):
    import cv2
    import mediapipe as mp
    from mediapipe.tasks import python
    from mediapipe.tasks.python import vision

    path = safe_path(root, row["file"])
    if sha256_file(path) != row["sha256"]:
        raise ValueError("Recording changed since ingestion")
    assets = {name: Path(tasks) / (name + "_landmarker.task") for name in ("hand", "pose", "face")}
    if not all(path.is_file() for path in assets.values()):
        raise ValueError("Official hand, pose and face task files required; run asset setup first")
    base = lambda name: python.BaseOptions(model_asset_buffer=assets[name].read_bytes())
    mode = vision.RunningMode.VIDEO
    capture = cv2.VideoCapture(str(path))
    if not capture.isOpened():
        raise ValueError("Cannot decode video")
    fps = capture.get(cv2.CAP_PROP_FPS)
    if not 15 <= fps <= 120:
        capture.release()
        raise ValueError("Unsupported recording FPS")
    frames, previous, index, fallback_count = [], -1, 0, 0
    try:
        with vision.HandLandmarker.create_from_options(vision.HandLandmarkerOptions(base_options=base("hand"), running_mode=mode, num_hands=2)) as hands, \
             vision.PoseLandmarker.create_from_options(vision.PoseLandmarkerOptions(base_options=base("pose"), running_mode=mode, num_poses=1)) as pose, \
             vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(base_options=base("face"), running_mode=mode, num_faces=1)) as face:
            while True:
                ok, image = capture.read()
                if not ok:
                    break
                timestamp = round(capture.get(cv2.CAP_PROP_POS_MSEC))
                if timestamp <= previous:
                    timestamp = max(previous + 1, round(index * 1000 / fps))
                    fallback_count += 1
                if timestamp > 10000 or index > 1200:
                    raise ValueError("Clip exceeds recording protocol bounds")
                rgb = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
                h, p, f = hands.detect_for_video(rgb, timestamp), pose.detect_for_video(rgb, timestamp), face.detect_for_video(rgb, timestamp)
                hand_rows, used = [], set()
                for i, landmarks in enumerate(h.hand_landmarks):
                    side = h.handedness[i][0].category_name.lower()
                    if side not in ("left", "right") or side in used:
                        raise ValueError("Ambiguous handedness; needs technical review")
                    used.add(side)
                    hand_rows.append({"handedness": side, "landmarks": [point(x) for x in landmarks]})
                frames.append({"timestampMs": timestamp, "imageSize":{"width":int(image.shape[1]),"height":int(image.shape[0])}, "hands": hand_rows,
                               "upperBody": [point(p.pose_landmarks[0][i]) for i in UPPER] if p.pose_landmarks else [],
                               "face": [point(f.face_landmarks[0][i]) for i in FACE] if f.face_landmarks else []})
                previous, index = timestamp, index + 1
    finally:
        capture.release()
    if len(frames) < 8:
        raise ValueError("Too few decoded frames")
    result = {"schemaVersion":"maeen-landmarks-v1", "sourceSha256": row["sha256"], "decoderFps": fps, "timestampFallbackFrames": fallback_count,
              "extractor": "mediapipe-" + mp.__version__, "taskHashes": {k: sha256_file(v) for k, v in assets.items()},
              "frames": frames}
    write_json(safe_path(root, "landmarks/" + row["clipId"] + ".json"), result)
    return {"clipId": row["clipId"], "frames": len(frames), "timestampFallbackFrames": fallback_count}
