# Fusion Viewer refinements

User requested direct implementation of 12 UI/search refinements. Existing DESIGN.md continues to apply, with requested subtle type colors overriding monochrome type chips.

- Use one styled, editable combobox for every existing select. Level and IV accept direct integer input and update stats immediately while retaining focus; choice fields filter their valid options. Preserve keyboard and mobile operation.
- Keep separate simple and advanced drafts, applied terms and recent histories. Parse operators only in advanced mode.
- Use the actual MIT-licensed hwantage/hansearch library for Korean Pokémon name matching in the selector, simple dex search, and advanced name terms. Vendor the original algorithm with a documented ESM wrapper adaptation.
- User chose official status as the classification rule: main → default dex; alt/temp → other. Compute separate counts/tag inventories, retain reference-tagged main sprites in the default dex, and exclude other variants from default search/counts.
- Rename visible brand to Fusion Viewer; bookmark icons replace hearts; save/copy become secondary utility actions; remove decorative English header labels and change-value separator marks; add subtle per-type colors.
- Verify pure behavior with tests, validate all imported data, build for GitHub Pages, and use desktop/mobile browser QA. No publishing or pushes requested.

## Completion evidence

- User chose official status grouping. Main: 158,992; other: 22,250 (including one upstream non-main status typo preserved as other).
- Implemented all visible branding/action/header/type-chip changes, editable comboboxes, live level/IV and custom EV allocation with validation, independent persisted query drafts/history, and hansearch 1.4.5 at revision 292b368c5137de5c7834954dc10254d647257f0c.
- Full suite: 18 passing tests; official data validation and GitHub Pages build pass.
- Browser: Korean initials in selector/simple/advanced names, independent drafts, direct numeric typing with retained focus, EV limit rejection, popup styling, bookmark controls, main/other views, two-Escape picker dismissal, no errors, no horizontal overflow at 320/390/1280 viewport overrides. Mobile popup uses document client width to keep clear of scrollbars.
- Independent review found Escape interception and stale search acceptance after off-dex language changes; both fixed and re-reviewed.
- Preview remains at the user’s selected 179.463 fusion. No commit, push, or deployment performed.
