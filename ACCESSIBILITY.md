# Accessibility

MAEEN is **designed and tested toward WCAG 2.2 AA**, not WCAG-certified. Arabic RTL and English LTR are available independently of sign-language selection.

The interface uses native controls, named form fields, skip-to-main navigation, route focus management, visible focus outlines and semantic status/error announcements. Motion can be reduced; touch-oriented controls and responsive layouts are provided. Text editing/display, visual Radar alerts and history do not require audible feedback.

Phase 7 Chrome axe scans reported no automated violations across six routes/two languages. Some contrast/video checks remain incomplete; token contrast tests and screenshot/source reviews are supplementary, not exhaustive. Browser keyboard input/clear/skip/navigation checks passed. 200% root text sizing and equivalent reflow passed; this does not certify every actual zoom/platform state. All 60 responsive checks passed at 375/768/1440 widths plus portrait/landscape variants.

Phase 8 expanded demo auditing also found WCAG 2.5.3 label-in-name issues in inherited brand/mode controls. Explicit overriding labels were removed so visible native text supplies their names; a regression test reproduced the issue before correction. This changes accessible names, not recognition or layout. Expanded browser results are in `docs/phase8/demo-review.json`.

NVDA, VoiceOver, physical touch operation and human Deaf-user acceptance remain **UNTESTED**. Live status verbosity, expanded controls, active camera overlays and all platform dialogs need further review. Current model recognition limitations are not resolved by accessible controls. See `ACCESSIBILITY_VALIDATION.md` for exact scope and remaining checks.
