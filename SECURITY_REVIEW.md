# Phase 7 security review

Scope: current frontend dependencies, public application source, worker and local production build. This is a bounded review, not a penetration test or certification.

## Dependencies and credentials

The npm advisory registry returned zero known vulnerabilities on 21 October 2026: info/low/moderate/high/critical all zero. The first attempts failed on sandbox DNS and native certificate trust; retry used Node `--use-system-ca`, without disabling TLS verification. Full response: `docs/phase7/dependency-audit.json`. This covers npm's resolved dependency graph, not all Python/native/OS components or future advisories.

A 124-file source/public/scripts scan found no matches for selected private-key, AWS key, GitHub token or OpenAI key patterns. No application API credential was found during fetch/config review. This is not an exhaustive credential scan; binary assets, git history, local operator files and every token format were not certified. Public model and attribution metadata are intentionally public. The existing training environment also passed `pip check` (no broken requirements); that checks dependency consistency, not security advisories.

## Network and cache boundaries

No application upload/analytics endpoint was found. Route browsing observed same-origin GETs only. The generated worker handles only its scoped public allowlist. Model and shell bytes are checked by size and SHA-256, corrupt entries rejected and hash-versioned models never substituted silently. Integrity protects consistency/corruption, not compromise of both the hosting origin and its worker/catalog. HTTPS hosting remains required. First uncontrolled network loads depend on trusted hosting.

Fault injection verified an interrupted model response is not stored and later recovers; a failed shell install retains the previous cache. Browser checks cover corrupt cache, cold offline states and explicit update. One real defect was fixed: update-check rejection was silently swallowed. It now provides a recovery message while preserving the current app; a regression test failed before the fix and passed after it.

## CSP and hosting limits

No enforced CSP was introduced without compatibility evidence. A candidate policy needs `default-src 'self'`, narrowly scoped `connect-src`, local scripts plus WebAssembly compilation support, `worker-src 'self' blob:` where runtime workers need it, and media/blob allowances for local previews. Existing React inline styles need accounting; a strict style policy cannot simply be pasted in. Test in report-only mode on a host supporting response headers before enforcement. A meta policy cannot implement every header directive; see [MDN CSP guidance](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) and [WebAssembly policy sources](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy). GitHub Pages is [static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages); no project-controlled header configuration was found in this repository. Clickjacking protection and advanced permissions policies require hosting-level decisions. This review does not claim CSP/header hardening is complete.

Local `/__phase6/*` endpoints exist only in the verification server; never publish that test server. No deployment was performed. Physical notification privacy, device compromise and third-party browser speech services remain outside the verified boundary.
