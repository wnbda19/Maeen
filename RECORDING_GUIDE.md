# Internal recording guide — دليل التسجيل
2026-10-21. Use only first-party consenting performers. Official videos are links for linguistic reference.

## Start the local tool
From app/: run `npm.cmd run collector`, then open **http://127.0.0.1:4196/collector.html** in a supported modern browser.
It builds a separate collector-dist/ bundle; the normal production app build excludes collector.html. Keep localhost/port/browser profile stable because IndexedDB is origin-specific. Do not publish the internal bundle or serve it on a shared network. No cloud backend, upload endpoint, telemetry or public-app service worker is registered by the collector. Its Content Security Policy blocks network connections; opening the official reference link is a deliberate browser navigation to the Association.

Select reference25 or mvp15 once per campaign. Choose S###, C##, target, repetition, actual condition/speed/distance and the written-consent reference. Check the operator consent flag only after evidence is verified. The exact reference opens in a separate tab; it is never embedded/downloaded into the tool.
Start recording; webcam access is requested only then, without audio. Use 3–10 seconds. Stop/save or wait for automatic stop near 10 seconds. Uncheck consent to cancel ongoing capture; an already saved clip is not deleted by this action. Unmount/close stops camera tracks. Permission/storage/codec errors are shown and do not claim a saved recording.

Clips are saved as genuine WebM or MP4 according to MediaRecorder support; extensions are never relabeled. Filename:
`S001_W101_C01_R01_T01.webm`.
The next take is assigned automatically for the same signer/session/term/repetition. Retakes never increase unique-slot progress.
Local duration validation uses the monotonic recording clock; **actual decoded duration is checked during import**. Every saved clip remains pending QC. Replay the saved clip in Review and export, then download its video and matching metadata JSON. Export the metadata index as a convenience; individual sidecar JSON files are required by the importer. Keep them together in a private exports folder. Do not put unrelated JSON files in it.

## Checklist / قائمة العمل
- تحقّق من الموافقة المكتوبة ورمزها، ولا تكتب اسم المشارك في الأداة أو الملف.
- شاهد رابط المرجع الرسمي للتعلّم فقط. سجّل أداء المشارك، ولا تنسخ فيديو المكتبة أو تصوّر الشاشة.
- الكاميرا أفقية وثابتة؛ يظهر الوجه والرأس والذراعان واليدان ومدى حركتهما وأعلى الحوض.
- لا صوت ولا مرشحات ولا انعكاس محفوظ. افحص اليمين واليسار بتسجيل معايرة منفصل.
- ٠٫٧٥ ثانية حياد ثم إشارة كاملة ثم عودة للحياد؛ المدة ٣–١٠ ثوانٍ.
- ١٥ تكراراً مستقلاً لكل مصطلح لكل شخص، موزعة على ثلاث جلسات. لا تعِد ترقيم التكرار مع كل جلسة.
- بدّل الإضاءة والخلفية والسرعة الطبيعية والمسافة مع بقاء تفاصيل اليد والوجه واضحة.
- أعد التسجيل عند الخطأ؛ لا تعدّ النسخة أو الإعادة تكراراً جديداً.
- راجع المقطع واحفظ الفيديو وملف JSON في مجلد خاص. تخزين المتصفح قابل للمسح؛ صدّر الملفات بانتظام.

## Offline import and progress
From training/ (Python environment prepared):
```powershell
.\.venv\Scripts\python.exe -m maeen_data.collection import --profile reference25 --exports C:/private/maeen-exports --root C:/private/maeen-reference25 --consents C:/private/maeen-consents/registry.json
.\.venv\Scripts\python.exe -m maeen_data.collection progress --profile reference25 --root C:/private/maeen-reference25 --output C:/private/maeen-reference25/progress.json
```
Import checks current written-consent registry, exact reference mapping, source declaration, safe names, hashes, actual decoding/duration and metadata. It copies originals into the private raw/ layout; never moves/deletes source exports or silently overwrites. If a copy is interrupted, reconcile the destination against source hashes before retrying; do not delete originals. Existing identical imports are idempotent.
Review/update metadata/recordings.jsonl with two reviewer codes, accepted flag and reasons. Keep one accepted take per logical slot; mark other attempts rejected, do not erase lineage. The training manifest must contain accepted rows only. Progress reports separate recorded and accepted counts and never declares training ready from counts alone. Dataset-wide counts are authoritative; browser counts cover only that origin/device.
No real live signing session was created by development tests. Simulated capture lifecycle tests are not participant recordings.
