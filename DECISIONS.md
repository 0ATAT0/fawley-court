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

## The gates that hold this

- `verify.mjs` — 5,552 checks, 0 failures. Adds section F: the shipped P&L pack
  must equal `Research/comp-pnls/web-data.json` leaf for leaf; every printed
  P&L figure (1,741 of them) must equal this file's own independent formatting
  of that source; every candour line must be verbatim in `REGISTER.md`. It also
  now checks the portal's own navigation figures against the registers, that
  every view leads with an exhibit, that no route is duplicated, and that the
  withdrawn internal marking has not returned.
- `audit.py` — 57 routes × 4 viewports with every disclosure forced open, plus
  the finder, the register filters, the capital-cost schedule's filters, the
  ladder, the ranking and the lightbox.
- `offline.py` — service worker `fawley-court-v3`, sampled routes offline.

## Known and deliberate

- Full-page Playwright screenshots stitch viewport-height tiles and can show a
  half-cut line of type at a seam. Checked against viewport captures at the same
  scroll position; the type renders whole. Nothing to fix in the page.
- The contents page keeps air between the description column and the figure
  rail. That white space is the index convention, not the ribbon defect: the
  right rail carries the headline figures.
