# Picker persistence, artist search and triple fusions

User scope: retain picker generation/type/sort/legendary filters between closes, add a searchable artist selector next to dex tags and document artist advanced queries, add FusionDex/Infinite Dex footer references and official game contribution links in footer and all READMEs, support official triple fusions. Authors were explicitly excluded by the user.

Follow DESIGN.md and the compact existing UI. Keep English default and Korean/Japanese support. All Pokémon, sprite, credit and stat data must originate in external databases.

- [x] Persist picker filters for this session; retain user typing behavior and fixed dialog position.
- [x] Derive scoped artist options from official sprite credits. Intersect selected artist, tag and scope on the same sprite; retain artist: queries and document them.
- [x] Import supported triple records from official species.dat plus component definitions and sprite file inventory. Use database base stats rather than guessing a formula; exclude bosses, missing components and missing images.
- [x] Add a compact triple lab with preset selector, three parents, sprite, base/actual stats and shared calculation controls; support links, history, last view and bookmarks.
- [x] Add footer references and game contribution links; update English/Korean/Japanese READMEs.
- [x] Test imports/filter intersections/routing/persistence and verify desktop/mobile UI, full tests, data validation and build.

Architecture: independent triple importer creates public/data/triples.json, route uses triple ID on a dedicated triple page, main app reuses the stat panel with explicit triple database provenance. Artist selection uses existing searchable combobox and worker. Existing dual fusion behavior remains covered by its tests.

Verification completed 2026-10-27: 70/70 tests pass with localhost test permissions; snapshot validation covers 501 species, 181,242 dual sprites, 23 triples and 7,400 artist choices. Browser verified fire/gen3 picker persistence, daz1610 exact-filter and advanced artist query, triple fixed/actual stats and compound types, bookmarks, saved last triple after dex navigation, and dual variant preserved through triple history/brand navigation. Korean, English and Japanese at320px have clientWidth=scrollWidth=305; desktop preview saved in .cache/triple-fusions-final.jpg. Code review findings on dual selection restoration and brand navigation resolved and rechecked. User excluded Authors; no author data or field shipped. No commit/push/deployment requested.
