"""Local review package only. Never publishes or reads participant directories."""
from pathlib import Path
import hashlib
import json
import subprocess
import zipfile

root = Path(__file__).resolve().parents[1]
version = '0.1.0-rc.1'
out = root / 'release'
out.mkdir(exist_ok=True)
archive = out / f'maeen-{version}-LOCAL-REVIEW.zip'
dist = root / 'app' / 'dist'
assert (dist / 'sw.js').is_file() and (dist / 'model-catalog.json').is_file(), 'Build production first'
files = {f'Maeen/{p.relative_to(dist).as_posix()}': p for p in dist.rglob('*') if p.is_file()}
docs = ['README.md', 'FINAL_FEATURE_MATRIX.md', 'MODEL_CARD_ARSL.md', 'MODEL_CARD_ASL.md', 'MODEL_CARD_SMART_RADAR.md', 'MODEL_CARD_ARABIC_WORDS.md', 'TECHNICAL_ARCHITECTURE.md', 'VERIFIED_METRICS.md', 'PRIVACY.md', 'ACCESSIBILITY.md', 'COMPETITION_PITCH.md', 'JUDGE_QA.md', 'COMPETITION_DEMO_SCRIPT.md', 'RELEASE_CANDIDATE.md', 'SECURITY_REVIEW.md', 'PWA_OFFLINE_RELIABILITY.md', 'STABILITY_REPORT.md', 'ARSL_LIVE_VALIDATION.md', 'ASL_LIVE_VALIDATION.md', 'SMART_RADAR_REAL_WORLD_VALIDATION.md', 'ACCESSIBILITY_VALIDATION.md']
files.update({f'RELEASE_NOTES/{name}': root / name for name in docs})
manifest = {name: {'bytes': p.stat().st_size, 'sha256': hashlib.sha256(p.read_bytes()).hexdigest()} for name, p in sorted(files.items())}
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for name, p in sorted(files.items()):
        z.write(p, name)
    z.writestr('SHA256_MANIFEST.json', json.dumps(manifest, ensure_ascii=False, indent=2))
    z.writestr('DISTRIBUTION_HOLD.txt', 'LOCAL REVIEW ONLY. ArSL redistribution provenance/project licensing unresolved. No deployment/public redistribution authorized. See RELEASE_NOTES/RELEASE_CANDIDATE.md.')
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    for name, record in manifest.items():
        assert hashlib.sha256(z.read(name)).hexdigest() == record['sha256']
report = {'version': version, 'date': '2026-10-21', 'archive': str(archive), 'bytes': archive.stat().st_size, 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'baseCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(), 'committedCandidate': False, 'deployment': False, 'distribution': 'LOCAL REVIEW ONLY / RIGHTS HOLD', 'files': manifest}
(root / 'docs' / 'phase8' / 'package.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k != 'files'}, ensure_ascii=True, indent=2))
