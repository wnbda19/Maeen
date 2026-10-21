# Smart Radar real-world validation — Phase 7

Physical speakers, room sounds, vibration and OS-delivered notifications: **UNTESTED**. No new field detection rate, false-positive rate or real onset latency is available. No exact direction/distance or background monitoring is claimed.

YAMNet and its thresholds remain unchanged. The extended browser test uses the existing licensed dog recording through a virtual microphone and genuine inference. A visual alert/history entry verifies that path; it is not a physical microphone experiment. Browser cooldown/duplicate/threshold behavior and denied/failing notification adapters have automated coverage. A successful vibration API call would not prove tactile delivery; no physical vibration result is claimed.

Inherited Phase 4 screening: one of two dog clips alerted; zero of two baby-cry clips alerted, giving three missed positive clips out of four. No enabled alert occurred in 16 screened negative clips. These small, partly related source clips do not establish a field rate. The sole detected clip alerted 2,917.4 ms from clip start, not annotated onset. Do not describe this as dependable emergency detection. See `SOUND_MODEL_EVALUATION.md` and its source evidence.

| Group | Physical validation | Existing evidence |
|---|---|---|
| Dog barking | UNTESTED | Recorded-input detection and a documented miss |
| Baby crying | UNTESTED | Both screened clips missed |
| Smoke/fire alarm | UNTESTED | Supported label only |
| Siren | UNTESTED | Supported labels only |
| Vehicle horn | UNTESTED | Supported labels only |
| Doorbell | UNTESTED | Supported label only |
| Knocking | UNTESTED | Supported label only |
| Phone ringing | UNTESTED | Supported labels only |
| Glass shattering | UNTESTED | Supported label only |
| Shout/scream | UNTESTED | Supported labels only |

For field acceptance use rights-cleared recordings at safe playback levels, multiple microphones, near/middle/far placements, quiet/noisy rooms and overlapping sources. Record source level/distance as controlled conditions, not model-estimated properties. Annotate onsets independently; include long negative sessions, event repetitions inside/outside cooldown and source-disjoint calibration/test sets. Report per-class true/missed events, false alerts per hour, confidence distributions and median/p95 alert latency. Never trigger real emergency alarms for testing without site authorization.
