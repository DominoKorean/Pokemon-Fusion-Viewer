# Lab refinements implementation plan

**Goal:** Address the user's lab layout, comparison, tag isolation, entry restoration and repository links requests.

**Architecture:** Keep the static ES module application and existing external data snapshot. Isolate comparison transactions and first-entry selection in small pure modules. Filter sprite eligibility before query matching in the worker.

**Constraints:** Follow DESIGN.md and compact AGENTS.md layout requirements. Support Korean, English and Japanese. Preserve current uncommitted classification changes. No deployment requested.

- [x] Reproduce numeric comparison drift and tag filtering with deterministic tests; implement editing transactions and restore a pin/unpin button without a baseline dropdown.
- [x] Test initial URL > valid last-viewed state > random known IDs, including denied/corrupt storage; persist normalized fusion selection.
- [x] Verify scope and tag filters intersect on the same sprite, including advanced queries and pairs with variants in both scopes.
- [x] Add GitHub and issue feedback links; show calculation rules above variants permanently.
- [x] Enlarge fusion art on desktop and allocate approximately 40% parent / 60% fusion space on mobile; reduce parent whitespace.
- [x] Run complete tests, data validation, build and desktop/mobile browser checks; update three READMEs to match behavior.

**Review focus:** Multi-keystroke numeric edits; duplicate change events; pin across mode/pair changes; partial or invalid shared URLs; denied storage; asynchronous searches after scope/tag changes; parent names at 320px.

Verified: 48 tests pass; 501 species / 181,242 sprite snapshot validation passes; static build passes. Browser: numeric 50→51 deltas +3/+2/+2/+3/+2/+2, pin/unpin, reference scope results 251 vs 3, last explicit #4.151e restored, 320px and 390px without horizontal overflow. Independent review found and verified the fix for explicit variant-only link precedence.

Ruling: Mobile 5/2 interpreted as left 2/5 (40%), communicated to user. Test server now uses an OS-assigned port to avoid conflicting with the running preview. No push or deployment requested.

## Follow-up: comparison semantics

Reproduced Adamant → Timid incorrectly showing ATK −19, SPA +14, SPE +12 as though all were current nature effects; swapping parents also retained cross-fusion base deltas. Nature changes now compare with neutral nature under the same current scenario; pinned comparisons have a distinct label. Superscripts and comparison controls are actual-mode only. Parent changes and history clear all comparison state, including pins; snapshots also carry a fusion identity as a defensive guard. Added regressions covering all 625 nature transitions, neutral reset, pin semantics, cross-fusion isolation and subsequent level edits.
