# Phase 7 accessibility validation

Target: WCAG 2.2 AA where applicable. Overall **PARTIAL**, not a conformance certification. User confirmed browser-only testing. NVDA, VoiceOver and physical touch use are **UNTESTED**.

## Automated production-browser evidence

Real Chrome axe-core scanned all six public routes in Arabic and English (12 combinations), including color contrast with actual browser layout, using WCAG 2 A/AA, 2.1 AA and 2.2 AA tags. No automated violations were reported. Some `color-contrast` and `video-caption` checks remain incomplete and require manual assessment; zero violations does not resolve those checks. The camera preview is local signing video rather than a captioned prerecorded spoken programme. Raw results, incomplete-rule IDs, live regions and keyboard traces: `docs/phase7/browser-accessibility.json`. This is broader than the existing structural jsdom test, which disables browser-only contrast evaluation. Axe cannot prove accessible screen-reader speech, correct sign-language interpretation or all dynamic states.

Each route also passed 200% root-font text sizing and a 640×450 viewport corresponding to the available CSS area of a 1280×900 desktop at 200% zoom. Neither produced horizontal overflow. This is reflow/text-size emulation, not an actual OS/browser zoom UI exercise. Reduced-motion media emulation was active; source inspection confirms the global reduced-motion override and Radar motion preference. Continuous capture status announcements and actual assistive-technology verbosity still need user testing.

## Browser keyboard and source review

Tab sequences were exercised for 14 steps on each route/language. Focused interactive elements had visible computed outlines; none was hidden. BODY entries without outlines occur at the normal document traversal boundary and are not invisible interactive controls. Route/language changes focus the named main region. The skip link focuses main. Source review confirms named forms, native buttons/selects/details, current navigation markers, status/alert live semantics and 3-pixel focus outlines. No application dialog was present on the scanned default routes; OS permission/install dialogs are browser-owned, not audited modal implementations.

Keyboard-driven text entry, Clear activation, skip-to-main and navigation activation were additionally exercised successfully (`keyboardInteractions` in the raw report). The raw tab trace is a limited keyboard traversal, not proof every nested/expanded state is reachable or usable. Manual source review and screenshot inspection supplement it; actual screen-reader announcement order remains UNTESTED. Default-route scans do not establish contrast in every active camera overlay or alert state. All 60 responsive checks passed, separately testing visible button/select/range sizes; checkbox hit areas, link spacing and all WCAG exceptions still need comprehensive manual review.

## Remaining acceptance work

Test NVDA in Arabic/English, VoiceOver on supported Apple devices, expanded category controls, dynamic permission/model failures, changing confidence and alert history, speech controls, genuine install dialog and actual 200%/400% browser zoom. Check reading order, verbosity, focus restoration, occlusion, non-text contrast and touch operation in those states. No accessibility redesign or unverified conformance badge was added.
