# Arabic typography decision

Reviewed 2026-10-20; recorded 2026-10-21 (Asia/Riyadh).

Official sources reviewed:
- [Thmanyah font](https://font.thmanyah.com/)
- [Official explanatory article](https://ask.thmanyah.com/خط-ثمانية-للجميع)
- [Official license](https://font.thmanyah.com/licenses)

The license allows personal/commercial design uses and embedding as part of a compiled, packaged or obfuscated product. It also prohibits redistribution/hosting for download and making font files independently extractable or reusable. The explanatory article points to the official email-based download and license rather than providing an unrestricted redistribution grant.

Compliance with ordinary static `@font-face` delivery on a public GitHub Pages site has **not been established**. Minification, base64 encoding or renaming would not establish compliance with the extraction restriction. No font was downloaded, accepted, converted, committed, embedded or remotely loaded.

Decision: retain **Tahoma → Segoe UI → Arial → sans-serif** as the temporary Arabic stack, exposed as `--font-arabic`. Apply it to Arabic text as well as RTL interface text, so Arabic recognition output keeps shaping in the English interface. Existing English typography remains Segoe UI. Hierarchy is strengthened through size/weight/spacing, not a substitute font download.

Owner action before changing this decision: obtain an official, explicitly permitted method for browser font delivery (including public hosting/cache extraction constraints) and an authorized font package. Then recheck Arabic shaping, controls, reflow and performance. This is a recorded implementation blocker, not a claim that all possible Thmanyah web usage is prohibited.
