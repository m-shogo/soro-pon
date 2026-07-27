# Batch 13 — UI / Safari / Cloudflare Matrix

Status: **EXECUTED — CONDITIONAL**

| Gate | Environment | Expected | Actual | Result | Claim scope / unblock |
|---|---|---|---|---|---|
| B13-UI-3P | shared app, both skins | no empty fourth seat; readable table | dedicated left/right/self layout | PASS | unit + visual + 24-case audit |
| B13-UI-4P | shared app, both skins | left/top/right/self table | shared semantic layout | PASS | unit + visual + 24-case audit |
| B13-READABILITY | 6 viewports × 2 skins × 3/4p | no overflow/collision/small enabled target | 24/24, all counters 0 | PASS | geometry + reviewed snapshots; not physical device |
| B13-A11Y-AUTO | React/Vitest/Playwright | semantic selection/dialog/focus/rotation | unit 434 and visual 80 green | PASS | automated scope |
| B13-INTEGRITY | exact product SHA candidate | persistence/import contracts green | 102/102 | PASS | local Node 24 |
| B13-BUILD | exact product SHA candidate | typecheck/build/deterministic inventory | aggregate `db7c527e…`; no maps | PASS | local macOS; ignored `.DS_Store` excluded |
| B13-PYTHON | local + exact-SHA CI | asset fixtures green | 92/92 local 3.14.5; final CI 3.13 pending | PENDING | local version differs; exact 3.13 claim requires CI |
| B13-CI | GitHub PR exact SHA | CI green | final candidate not pushed | PENDING | push preview branch and wait for exact SHA |
| B13-CI-INTEGRITY | GitHub PR exact SHA | workflow green | final candidate not pushed | PENDING | push preview branch and wait for exact SHA |
| B13-SAFARI-4PATH | Safari 26.4 / macOS 26.4.1 | both skins × 3/4p reach Result | 4/4 Result | PASS | real Safari controlled via macOS accessibility |
| B13-SAFARI-ROTATION | same | ≥20 cycles and ≥20 min | 24 cycles / 1,854 sec; Result 2; failures 0 | PASS | real Safari on product frozen SHA |
| B13-SAFARI-DIAGNOSTICS | same | console/page/network captured | unavailable | NOT TESTED | enable WebDriver/Develop inspection |
| B13-VOICEOVER | real VoiceOver + Safari | change-affected major flow | TOP / setup / Game static image + owner context + interactive hand | VOICEOVER_PASS | Deck Detail, Result, dialog and focus return remain SUPPLEMENTAL_ONLY |
| B13-CF-PREVIEW | Cloudflare Pages | deployed smoke green | account sign-in waiting | BLOCKED | owner signs in once; create/connect Pages project |
| B13-CF-PRODUCTION | Cloudflare Pages | deployed smoke green | Preview incomplete | NOT TESTED | pass Preview, deploy exact SHA to main |
| B13-CF-ROLLBACK | Cloudflare Pages production history | current → previous smoke/storage | no production history yet | NOT TESTED | use formal Pages rollback after two successful production deployments |
| B13-CF-RESTORE | Cloudflare Pages production history | previous → current, hash restored | rollback incomplete | NOT TESTED | restore current deployment and rerun smoke |
| B13-IPHONE | physical iPhone Safari | post-release device gate | not executed | KNOWN UNVERIFIED | connect device and run production checklist; not a blocker |
| B13-PRODUCT-DEFECT | executed scope | open = 0 | fixed 4; open 0 | PASS | unexecuted real-environment scope excluded |
| B13-CORRUPTION | executed storage/import scope | 0 | 0 | PASS | not a fleet/device-wide claim |
| B13-DEAD-END | executed automated + Safari paths | 0 | 0 | PASS | blocked flows are not counted as tested |

## Evidence

```text
docs/qa/evidence/batch-13/visual-review/
docs/qa/evidence/batch-13/safari-mac/
docs/qa/BATCH-13-UI-AUDIT.md
docs/qa/BATCH-13-VISUAL-REVIEW-PACK.md
```

Classification vocabulary:

```text
PASS / VOICEOVER_PASS / SUPPLEMENTAL_ONLY / PENDING /
NOT TESTED / KNOWN UNVERIFIED / BLOCKED / FAIL
```
