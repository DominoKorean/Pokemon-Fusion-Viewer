# Fusion Atlas implementation plan

**Goal:** Build the requested compact, multilingual Infinite Fusion sprite and stat viewer in this repository.

**Architecture:** Dependency-free ES modules, static HTML/CSS, a data import pipeline that transforms official external databases into provenance-tracked JSON, and remote official sprite sheets. User approved immediate implementation of the lab and dex approach, Korean default with English/Japanese support.

**Spec:** User request and repository DESIGN.md. User density requirements override the reference's spacious editorial layout. No invented Pokémon data or embedded substitute sprites.

## Constraints and decisions
- Use official infinitefusion-e18 species.dat; show its version and retrieval date, without claiming equivalence to newer releases.
- Import names, nature effects, type names, stat names, and legendary classifications from PokeAPI CSV databases.
- Import official sprite credits and tags; retain creator credit per variant.
- Calculate from imported base values using the official FusedSpecies.rb rule, including separate integer divisions and the Normal/Flying exception.
- Use a codex branch in the user's checkout; retain the user's untracked DESIGN.md.
- No dependencies required for the site, data pipeline, server, or unit tests.

## Review focus
1. AND precedence, parentheses, quoted Unicode, multiline input, unknown keys, invalid numeric/type values.
2. Missing/unavailable external data must produce visible retry/error states.
3. National dex numbers and game IDs must not be confused, including forms.
4. Rapid selector changes and delayed sprite loads must not show stale results.
5. Mobile overflow, keyboard dialogs, saved items, and comparison baseline behavior.

## Tasks
- [x] 1. Write and run failing tests for Ruby Marshal import, fusion stats/type calculation, stat scenarios, and query parsing. Implement pure modules and pass tests.
- [x] 2. Import official external databases; validate ID uniqueness, localized names, six positive stats, metadata, and sprite references. Preserve source URLs and hashes.
- [x] 3. Implement responsive lab, organized selector, nature/level/IV/EV/ability dropdowns, pinned comparison, variants, and local favorites.
- [x] 4. Implement sprite dex, tag filters, sort/pagination, highlighted multiline query editor, syntax errors, and localized query help.
- [x] 5. Run full tests, data validation, static build, desktop/mobile browser QA, and source review. Provide local preview and explain the blocked source export.

## Progress
Research: official e18 database uses Ruby Marshal 4.8 and can be read without executing external code. Current Hoenn database is a different format and is deliberately not interpreted as the same dataset.

Verification: 10 tests pass, including full HTTP server checks. Data validator passes 501 species, 181,242 sprites and 25 natures. Independent reviewer findings about stale query responses, optional saved-result lookup, and form sprites were fixed and reverified. Browser QA confirmed Korean selection, all three UI languages, level changes, pinned deltas, Wonder Guard HP 1, multiline numeric/type queries, error-state persistence, saved-item persistence after reload, and no horizontal overflow at mobile viewport overrides 390 and 320.

Publishing: private Site identity was created and saved in .openai/hosting.json. Automatic approval review rejected the source upload because the user had not explicitly authorized exporting source and generated data to the external Sites repository. No source was uploaded and no deployment was performed. Do not bypass the rejection; user approval is the remaining publication gate. All local implementation work is reviewable in this checkout on codex/fusion-viewer.

Image verification: excluded 8,247 credited variants whose official custom-sheet files are not available in the public repository. The importer now validates the complete official Git tree and the data validator checks every indexed variant against that inventory.
