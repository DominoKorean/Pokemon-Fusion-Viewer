# Search discovery implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task.

**Goal:** Prepare search discovery and sharing for the website and individual database-backed fusion combinations.

**Architecture:** Build crawlable HTML entry pages and a partitioned XML sitemap from the existing external database snapshots. Reuse the existing viewer on those entries, preserve legacy query links and browser history, and keep bookmarks and filters out of the index. Centralize the public URL and metadata; generate a local social preview from the existing real website screenshot.

**Tech stack:** Node 22, ES modules, static HTML/CSS, existing GitHub Pages Actions workflow.

**Spec:** User request in this chat; UI follows `DESIGN.md` and `AGENTS.md`.

## Constraints

- English default; Korean and Japanese names remain discoverable. Never fabricate Pokémon data.
- Keep the interactive UI compact and existing random/last-view behavior intact.
- Published output must fit GitHub Pages limits; no per-variant or filter duplicate URLs.
- No invented ownership verification, ratings, or search-engine indexing guarantees.
- Do not commit or push without a user request.

## Tasks

- [x] Test stable entry routes, legacy links, initial saved selection and canonical metadata.
- [x] Add reusable SEO metadata and build-time static entry generation, crawlable indexes, partitioned sitemaps and a size guard.
- [x] Integrate clean entry routing with the viewer and safe local development routes.
- [x] Add a real screenshot preview image, icons, manifest, robots guidance and a useful 404 page.
- [x] Document Search Console/Bing submission, GitHub project robots.txt limitations and metadata maintenance.
- [x] Run regression tests, database verification, a full production build, link/sitemap checks and browser QA; request a focused review.

## Verification record

- 79 tests passed; imported database verification passed (501 species, 181,242 sprites, 23 triples).
- Production output: 251,529 canonical URLs in 7 sitemaps, approximately 867.2 MB. `verify-search` matched every sitemap URL against the database inventory and an existing HTML target.
- Actual JPEG dimensions: 1200×630. Icon and manifest paths/sizes verified.
- Browser QA: explicit pair/variant and triple entry, random-parent change and Back, root last-view restoration, explicit Copy link on a generic home URL, clean dex entry after a remembered triple, and 320px mobile lab/index without horizontal overflow.
- Fresh reviewer found two regressions (generic-home sharing and remembered triple overriding dex); both fixed and verified. Follow-up review found no remaining important issues.
- Ruling: use one English canonical entry per combination with localized Pokémon names, rather than tripling all generated URLs; preserves meaningful language data while fitting GitHub Pages. Canonicalize sprite variants and filters to avoid duplicate sitemap entries.
- No commit, push, account verification or search-engine submission performed.
