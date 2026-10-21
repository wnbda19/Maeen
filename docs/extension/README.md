# Phase 2 extension evidence

Verified 2026-10-21 (Asia/Riyadh). Local production preview: `/Maeen/` on port 4192; nothing deployed.

Only materially changed screens are captured. All camera screenshots are stopped states. The word area has no model or predictions. The learning area shows original model labels, not fabricated sign art.

| Screen | Desktop | Mobile |
|---|---|---|
| Letter mode | [1440](letters-ar-1440.jpg), [complete controls](letters-ar-1440-full.jpg) | [375](letters-ar-375.jpg) |
| Word mode | [1440](words-ar-1440.jpg), [complete workspace](words-ar-1440-full.jpg) | [375](words-ar-375.jpg) |
| Learn Signs | [1440](learn-ar-1440.jpg) | [375 introduction](learn-ar-375.jpg), [gallery](learn-gallery-ar-375.jpg) |
| Radar capability distinction | [1440](radar-ar-1440.jpg) | [375](radar-ar-375.jpg) |
| More Features | [1440](more-ar-1440.jpg) | [375](more-ar-375.jpg) |

- [Arabic layout measurements](responsive-ar.json): 24 states.
- [English layout measurements](responsive-en.json): 24 states.
- [Rendered contrast samples](rendered-contrast.json): all primary routes plus Words/Learn and expanded feature descriptions; no sampled failures.
- [Large text and high contrast](large-text-contrast.json): seven task states at 375px; no overflow or sampled contrast failures. Preferences persisted after reload at `/Maeen/`.
- [Keyboard focus](keyboard.json): Enter opens the prayer disclosure, with a 3px solid outline on the final build.
- [Radar keyboard and reduced motion](radar-keyboard-motion.json): ArrowRight changes the threshold from -25 to -24 dBFS; both signal rings have `transform: none` and `0s` transitions with reduced motion enabled.

The 48 standard layout states comprise six primary routes plus two additional translator modes, at 375/768/1440px in both languages. Measurements wait for each route heading to render before checking. A 15px desktop scrollbar explains `clientWidth` below `innerWidth`; overflow compares scroll width against client width. Active buttons/forms/disclosures were checked for heights of at least 44px; all six mobile navigation links also exceed 44px in both dimensions.

Contrast sampling composes computed solid backgrounds and checks directly rendered text; disabled/transparent elements are excluded. This is a useful regression check, not full WCAG or human screen-reader certification. Large-text checks and contrast samples were recorded on the preceding build; the final production change added only the summary focus selector. The final 48-state matrix, focus check and screenshots were rerun on the final build.
