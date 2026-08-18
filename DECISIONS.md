# Structural decisions

The rulings this arrangement rests on, and the judgments taken inside them.
Kept so a later revision knows what was deliberate.

## The four ruled fixes (17 August 2026)

1. **The landing page is only the contents.** No hero, no duplicate summary
   tiles. Each chapter row carries its description and its headline figures, so
   the contents *is* the summary. The executive summary survives as chapter 01,
   reachable from that contents.
2. **The sticky "in this chapter" sidebar is gone.** A sticky tab strip per
   chapter, plus an index of views on each hub, does its job in less space and
   at every width.
3. **The measure defect is fixed site-wide.** Body prose is held near 70ch and
   always composes beside something — its exhibit, its sources, or a second
   column of prose. The reported case (the Bridge lede beside dead space) now
   sets the standfirst against the two headline figures and the walk beneath
   them.
4. **The internal marking is withdrawn.** No badges, rust chips, rust masthead
   rules or callout bars. The two former internal chapters stay; the marking
   goes. `verify.mjs` now fails if any of that treatment returns.

## Judgments taken beyond the agreed map

- **Every chapter is a hub with a tab strip**, not only the ones the map named.
  One grammar across the portal: the overview leads with the chapter's own
  exhibit, the tab strip is the index, and multi-view chapters repeat that index
  as a list with a figure against each view. Single-view chapters (01, 06, 08)
  show no strip.
- **The Evidence chapter's rate ladders are two views, not one.** "Cohort rate"
  and "UK rate" are each a full table; together they were a screen and a half.
  Same reasoning for cohort operations and UK operational evidence, which the
  brief already suggested as a parallel pair.
- **The Underwrite opens on the sixteen-line dial digest** (the same set the
  bar's Dials sheet carries), with the ten-row dial set — the one with basis and
  note columns — as the first tab behind it. The digest answers "what are we
  underwriting" in one screen; the dial set answers "on what basis".
- **The Diligence hub shows no view index.** The register is 1,500 nodes; a list
  under it would never be read. The tab strip is its index.
- **The residences are two views** (adopted product, sold evidence) rather than
  one, on the same one-screen rule.
- **The finder indexes content, not just titles.** Every string inside every
  view's blocks is in the haystack, so "EFG" finds the charge on the title page
  and "Cherrilow" finds the applicant on the planning page. Hits show the phrase
  they matched, in its own case.
- **The comparative P&L view leads with the ranking**, then sets the finding
  beside its qualifier, then the eleven-row table. The ordering is the headline,
  so the chart carries it and the sentence explains it.
- **Case P&L display names come from the case studies.** The pack writes
  "Chateau de la Messardiere" in ASCII; the case studies carry the accented name
  and are gated verbatim against the deck, so the accented form is used and
  `verify.mjs` derives the same substitution independently.
- **The subject's occupancy is never a point in the comparative.** The pack's
  own table prints 65.0% for Fawley; the portal prints the 60–70% interval and
  states 0.65 as the model input in the table note, keeping the house
  convention.

## The v16 re-strike (18 August 2026)

1. **The portal moved to Financial Model v16; the memorandum did not.** Angus
   ruled the re-strike portal-only, so a new source of record was built for it —
   `Model/docs/v16-figures.json`, measured on a scratch copy of the saved
   workbook — and the deck's `slides.md` was left where it was. Every model
   figure on the page now comes from that record, and `verify.mjs` gates against
   it rather than against the deck.
2. **Prose is now one of two things, and the gate says which.** A line that is
   still the deck's word for word is checked verbatim as before. A line the
   re-strike rewrote is the portal's own and is checked figure by figure against
   the measured record. The tally is printed on every run — 329 portal-authored
   lines at the time of writing — so the drift is visible rather than assumed.
3. **The capital cost is its own chapter, not a dial.** The ground-up budget is
   146 lines with a quantity, a rate, an evidence class and a sourcing sentence
   each; a five-line summary could not carry that, and a PDF could not make it
   searchable. The schedule is the chapter's centrepiece and the finder indexes
   every line.
4. **The reduction is shown, not smoothed.** The budget as first built, the
   ruling that it was too expensive, all 43 line changes and what each group was
   worth — including the four presentational trims, named as such.
5. **The bridge was re-measured rather than relabelled.** Its capital-cost lever
   fell from +7.34pp to +0.75pp because the ground-up budget lands within £3m of
   Embassy's own. Keeping the old walk with a footnote would have kept a lever
   the underwrite no longer has.
6. **Two lineage cases were dropped from the table.** The floor case and the
   flag-failure branch live on older books that cannot be reproduced on v16;
   they are named in the note instead of being shown as if they were current.

## The capital-cost chapter, cut back (19 August 2026)

Angus's comments on the chapter, taken as given. What changed, and what it cost:

1. **Two views were withdrawn** — "What It Rests On" (the evidence-class
   analysis) and "How It Came Down" (the reduction chain). Their renderers and
   everything only they used were deleted rather than hidden. The evidence class
   still shows on every line of the works budget; the reduction record survives
   in `Model/capex/PROPOSAL.md` and in the v16 measurement record.
2. **The folded argument is gone from this chapter.** Every "reasoning & basis"
   disclosure in chapter 05 was removed except the one under "What Is Not In It",
   which Angus did not comment on. The chapter is now exhibits only. The
   preliminary-and-subject-to-DD statement is carried by the page footer on every
   view, so the standing Align rule still holds.
3. **The word "limb" is gone from the chapter**, along with the "x is y, not z"
   construction wherever it appeared here. The filter reads Everything / Hotel /
   Residences and sits under the search box, which is now first.
4. **"The Schedule" is "Works Budget"; "Spend Over the Programme" is
   "Programme"; "The Residential Limb" is "Residential".**
5. **The zone matrix was rebuilt.** It was a flat wide table; it now carries a
   navy wash scaled across the whole matrix so magnitude reads off the cell, a
   sticky zone column, section dividers, and a programme bar per zone in place of
   the "Q5–14" text. The wash is composited to an opaque colour in the renderer
   rather than left as an alpha, because `audit.py` reads
   `getComputedStyle().backgroundColor` and cannot see through an alpha — it
   scored charcoal-on-navy and failed. Opaque values keep the audit honest.
6. **The programme leads its own view.** Sixteen zones against the quarters they
   are built in, with the opening quarter and the first residential sale marked
   across every row, over a four-figure milestone strip. The spend chart follows,
   because when the money leaves is a consequence of the programme rather than the
   subject. Both come from the same pack; the two dates come from the v16 record.
7. **The residential budget table** gained its basis sentence under each line, a
   magnitude rule on the cost column, and a constrained measure on the returns
   table beside it. The four presentational trims were removed with the reduction
   view; they remain named in `PROPOSAL.md` and in the v16 record.
8. **`navToken` now accepts the capital-cost pack.** Navigation figures were
   checked against the deck, the bridge and a hand-kept allowlist; they now also
   validate against `capex-web-data.json`, and the entries the withdrawn views
   needed were dropped from the allowlist rather than left to widen it.

**What was lost, stated rather than buried:** the buildings-against-the-estate
split — £1.46m a key on the seven buildings against £0.75m a key on the estate
around them — was the chapter's own finding and no longer appears anywhere on the
portal. It is in `Model/capex/REGISTER.md` and the deal record.

## The reading path (19 August 2026, second pass)

Angus's diagnosis: the eye scatters, section titles get lost, and the site sits
too far toward the printed memorandum on the website-to-PDF spectrum. Three
habits were doing it, and all three are print habits:

1. **Section headings were 11px uppercase captions** — smaller than the text they
   governed, so they read as labels on a page rather than as structure on a
   screen. They are now real headings at h2 scale in sentence case, with a rule
   under them, generous space above and tight space below, so a heading binds to
   its own content instead of floating between two blocks. The chapter index's
   "In this chapter" got the same treatment site-wide.
2. **Prose was forced into table cells.** On "What Is Not In It" that gave six
   paragraphs a 130-character measure beside a column of em dashes. They are now
   statements: the name on the left, the prose at a measure in the middle, the
   size on the right — a definition list that uses the canvas.
3. **Spacing was uniform, so nothing grouped, and figures repeated at equal
   weight, so the eye kept re-checking which one was the statement.** Sections
   are now separated by 42–78px and bound to their content by 15–22px. On The
   Budget, each total belongs to its own column label rather than being restated
   under the bar it describes, and the headline strip no longer repeats the two
   figures the bars carry immediately below it.

Also in this pass, on Angus's list: the works budget gained a column header with
a sort on the amount (which dissolves the zone grouping, because a list cannot
be in two orders at once, so each line carries its zone in its own meta line);
the cost matrix's eight element columns are exactly equal and its headers wrap;
the residential basis sentences run at reading size with room to breathe.

This treatment is applied to chapter 05 only. The rest of the portal still uses
the old micro-label, and is ready to follow on a word.

## The architecture ruling (19 August 2026)

The core portal stays one HTML file. Advanced bolt-ons — a European market
walkthrough being the live case — get their own files, fetched when asked for and
warmed into the offline cache after load, the way `sw.js` already treats the
full-size photography. The reason is not total weight: the page is 205KB on the
wire gzipped, which is fine. It is that code in `index.html` parses on every
visit whether or not the reader opens the thing, and a walkthrough is the kind of
surface that should cost nothing until it is asked for.

## The gates that hold this

- `verify.mjs` — 5,442 checks, 0 failures. Adds section F: the shipped P&L pack
  must equal `Research/comp-pnls/web-data.json` leaf for leaf; every printed
  P&L figure (1,741 of them) must equal this file's own independent formatting
  of that source; every candour line must be verbatim in `REGISTER.md`. It also
  now checks the portal's own navigation figures against the registers, that
  every view leads with an exhibit, that no route is duplicated, and that the
  withdrawn internal marking has not returned.
- `audit.py` — 55 routes × 4 viewports with every disclosure forced open, plus
  the finder, the register filters, the works budget's filters, the ladder, the
  ranking and the lightbox.
- `offline.py` — service worker `fawley-court-v4`, sampled routes offline.

## Known and deliberate

- Full-page Playwright screenshots stitch viewport-height tiles and can show a
  half-cut line of type at a seam. Checked against viewport captures at the same
  scroll position; the type renders whole. Nothing to fix in the page.
- The contents page keeps air between the description column and the figure
  rail. That white space is the index convention, not the ribbon defect: the
  right rail carries the headline figures.
