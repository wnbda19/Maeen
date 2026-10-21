# Phase 7 stability and performance

Status: **PARTIAL**. Chrome on this Windows host, virtual recorded camera/microphone input, production `/Maeen/` build. No physical-device or all-day qualification. Raw evidence: `docs/phase7/browser-check.json` and `pwa-run.log`.

## Extended bounded run

30 alternating ArSL/ASL camera starts and language changes, interleaved with 30 YAMNet microphone starts and route exits, completed over **328,812 ms (5 min 28.8 sec)**. Each feature remained active for an additional five seconds per iteration. These were genuine model operations using the existing licensed fixtures, not fabricated predictions. Most cycle time was offline with the server refusing app requests.

All **60 post-navigation checkpoints** had zero live camera/microphone tracks, zero workers and zero open AudioContexts. At most one audio worker existed concurrently. Feature pagehide/freeze/shutdown listener counts returned to zero; one persistent PWA visibility listener remained. No browser page errors or model redownloads occurred. These checks do not directly count every MediaPipe/native allocation or prove absence of duplicated native sessions.

After forced GC, JS used heap rose from **4,984,336 to 6,240,268 bytes** (+1,255,932 bytes, about 1.20 MiB). Backing storage rose from 437,711 to 700,031 bytes; embedder heap from 1,577,472 to 1,905,168 bytes. This growth is measurable and unresolved as a long-duration trend: two endpoints cannot distinguish bounded browser/runtime caches from a continuing leak. No speculative application rewrite was made. Follow-up should sample heap/native memory periodically over at least an hour, compare repeated batches and inspect retained objects. Do not report leak-free behavior.

## Fresh engineering timings

Initial DOMContentLoaded was **63.2 ms**. This run queried paint entries before FCP was available, so its initial FCP field is absent rather than zero. The separate accessibility audit waited for an actual paint entry and measured **FCP 348 ms**, DOMContentLoaded 44.9 ms. Time-to-interactive is not instrumented and remains unmeasured.

First ArSL camera ready was **3,112 ms**, followed by ASL at **475 ms** with the shared runtime warm. Radar displayed model initialization **333 ms** and the last inference **47 ms**. These are single-run localhost desktop timings, not averages or mobile benchmarks. Resource-level ArSL/ASL first transfers took **33.1/22.7 ms**; they are not complete model initialization timings. Human recognition latency, representative live FPS and realistic mobile/network timings remain unmeasured.

## Recovery and interruption

Warm offline reload, ArSL, ASL and Radar worked; missing offline models showed guidance and Radar preserved level fallback. Corrupt ASL cache was rejected offline then repaired online. Real waiting-worker update and reload passed. Deterministic worker fault injection rejected interrupted bodies and retained the previous shell on failed install. Update-check failure messaging has a new reproduced regression test.

Headless Chrome did not emit an actual freeze event in this experiment; the handler was injected explicitly. Track mute was also injected. These tests validate cleanup code, not actual mobile suspension or another app taking the microphone. Physical install/reopen, interruptions, background/foreground and native notifications remain UNTESTED.
