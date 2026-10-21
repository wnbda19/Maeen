# Phase 6 mobile and performance verification

Local desktop Chrome 145, localhost `/Maeen/`, 21 October 2026. These are engineering measurements from one run, not mobile performance benchmarks or new model accuracy results. Camera and microphone used genuine recorded fixtures as virtual devices, with real inference.

| Measurement | Observed |
|---|---:|
| Initial DOMContentLoaded | 50.8 ms |
| First contentful paint | 340 ms |
| First ArSL camera ready, including initialization | 3,100 ms |
| ASL camera ready, shared runtime already warm | 501 ms |
| ArSL model asset fetch/read and verification | 30.9 ms / 847,916 bytes |
| ASL model asset fetch/read and verification | 24.7 ms / 369,575 bytes |
| Vision WASM first transfer/read | 188.9 ms / 11,453,626 bytes |
| Hand landmarker first transfer/read | 176.1 ms / 7,819,105 bytes |
| Radar ready / reported YAMNet initialization | 1,214 ms / 305 ms |
| Radar last reported inference | 46 ms |
| Offline ArSL / ASL camera ready | 840 / 460 ms |
| Offline Radar ready | 227 ms |

Asset times are not full classifier initialization times. These sequential measurements have different warm states and must not be compared as model rankings. Initial navigation requested no AI assets. Warm offline operation requested no additional model downloads.

After four repeated navigation/language cycles, garbage-collected JS heap changed from 4,965,404 to 5,127,348 bytes (+161,944 bytes). Every cycle ended with zero live capture tracks, workers and open AudioContexts. At most one audio worker existed concurrently. Feature lifecycle listeners returned to zero on unmount; one app-wide visibility listener remained. This bounded check does not establish absence of native/WASM or long-duration leaks.

## Mobile-oriented behavior

All 60 route/language/viewport checks passed: six routes, Arabic/English, 375×812, 812×375, 768×1024, 1024×768 and 1440×900. Checks cover overflow, RTL/LTR, one top bar, navigation, heading clearance and visible interactive touch targets. Active virtual-camera portrait/landscape resizing retained one capture track. Rear-camera selection requested `facingMode: environment`; physical lens selection remains untested.

Camera and microphone permission rejection were exercised through browser denial. Pagehide, hidden-page, freeze, update shutdown, ended/muted tracks and suspended/interrupted audio have cleanup handlers and automated tests. Browser interruption checks injected track mute and document freeze. Chrome's lifecycle command produced zero actual freeze events in this run; the injected handler test is not proof of real mobile suspension. Devices stop rather than silently restarting; foreground restart requires user action.

No physical Android/iPhone, physical camera/microphone, OS installation/standalone launch, hardware rotation or extended background session was tested. Safari/iOS compatibility and low-memory mobile performance require physical-device acceptance testing. No background microphone monitoring is claimed. Existing experimental model accuracy and Radar reliability limitations remain unchanged.
