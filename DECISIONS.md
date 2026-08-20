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

## The v29 re-strike, and the gate that could not see it (19 August 2026)

Chapter 05 moved to the current capital budget overnight. Every other chapter still argued the
case the model had left behind three versions earlier, and the gate passed all of it.

1. **The whole page is on one basis again.** Chapters 01, 02, 03, 04, 06, 07, 08 and 09, plus the
   figures map, the dial sheet, the entry ladder, the bridge block, the ten case plates and 31
   subject cells inside the written hotel pages. The masthead names v29 because every chapter is.
2. **Five blocks are generated, not written.** `tools/build-blocks.py` rebuilds the figures map,
   the dial sheet, its source line, the ladder and the bridge from the measured record, so the next
   re-strike is a rerun. The record itself and the capital-cost, cheat-sheet and estate-area packs
   are carried in by their own inline tools.
3. **Chapter 09 is generated from the workbook's own Cheat Sheet tab.** Every printed value as the
   sheet renders it, every note from the sheet's own off-page register, keyed by the cell it
   annotates — so a note cannot drift onto the wrong figure. The previous pack had been transcribed
   by hand out of a PDF render, which is how it came to carry v16 prose beside v28 numbers.
4. **The gate now fails on a retired figure.** It used to accept any figure that appeared in a
   registered source, and each version's record stayed registered after it was superseded, so a v16
   number inside a v29 chapter was indistinguishable from a live one. `verify.mjs` carries the
   retired headline figures of v15 and v16 and fails on any that survives on a model-figure
   surface. Comparable packs are excluded, where the same string can be another hotel's honest
   number. Eight survivors were found this way, in chapters the re-strike had already been through.
5. **The subject-figure allowlist held sixty of v16's own figures**, which is the same defect in a
   different place. It now holds only tokens that are not model figures at all — key counts, an
   index, the occupancy interval — and the capital-cost pack joins the registered set instead.
6. **The written hotel pages are rebuilt from staging files.** Each page reads a comparable against
   the subject, and the subject column is the underwrite's own figure. Editing the assembled pack
   is undone the next time the pack is assembled, so `tools/restrike-hotelpages.py` corrects the
   staging files and a gate check names it by name when a stale figure comes back.
7. **Three surfaces sat outside what the check scopes, and all three were stale.** The equity
   waterfall's own spec was a hardcoded array, so chapter 04 drew a v16 drawdown beside a v29
   table; it is generated from the record now, and so is its closing bar. The written hotel pages
   and the comparable P&L register name the subject in their *prose* as well as in their subject
   column, and those sentences were still on the earlier margin and revenue a key. The hotel-page
   re-strike sweeps prose too, but only phrases that name Fawley — Cliveden House traded at £756k
   a key in 2012, which is exactly our old revenue a key, and three surfaces keep that figure and
   are right to.
8. **A render-only defect shipped through 8,661 passing checks.** The generated cheat pack put its
   provenance under the key the renderer prints as the sheet's header line, so chapter 09 displayed
   "[object Object]". Nothing mechanical could see it; the render did, immediately.

**What was corrected in the model itself.** v29 is a prose pass on v28 and moves no number — 10,589
values compared, zero numeric differences. The Cheat Sheet tab was still written on v16: it called
the estate off-market when CBRE has an information memorandum out, described ten days of Regatta
against six and a 300-member club against 250, printed a 1.25x covenant as "1.3x", and carried all
64 register annotations on the earlier numbers. One of those annotations repeated a £3.45m capital
call at a 1.30x cover test; measured on this book that call does not exist, so the note now says
what 1.30x actually does — draws £120.0m of refinancing rather than £124.8m, leaves the equity
requirement where it is, and costs five basis points of return.

**Gates:** verify.mjs 8,661 checks and 0 failures; audit.py clean; offline.py clean; eleven routes
rendered at four widths with no console error and no sideways scroll. The deployed page was
confirmed byte-identical to the commit.

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

- `verify.mjs` — 5,432 checks, 0 failures. Adds section F: the shipped P&L pack
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

## Chapter 10, The Ultra Luxury Market (18 August 2026)

Added as a chapter of its own rather than inside Evidence & Comparables, so the form can be
experimented with without disturbing a settled chapter.

**Ordered by months open, then rate.** This is the whole argument of the page. In this set the
two run against each other — everything above £1,200 closes for two to seven months, and the
four properties that trade all twelve months sit at the bottom of the rate table. Sorting by
rate would have buried that; sorting by calendar makes the page state it structurally.

**Fawley Court sits in the index as the subject**, in the United Kingdom group, on the navy
subject rule the tables already use. Its twelve bars are drawn as outlines rather than filled,
because its rate is underwritten and every other row is collected. That distinction had to be
visible rather than written.

**The strips read season shape, not rate.** Bar height is each month's median against that
hotel's own peak, so a tall bar on Domaine des Etangs at £522 is the same height as one on
Messardière at £3,179. The alternative — one shared scale, so height means rate — was rejected
because it would have flattened the cheap end into slivers and lost the shape, which is the
finding. The source note says so explicitly, because the chart is otherwise readable as a rate
comparison.

**Caveats are marked on the row, not only in the disclosure.** Sorting by calendar put Castiglion
del Bosco at the head of the whole index on a lead-in its own engine refuses for minimum stay.
An unopened row would have led the page with a figure we know is not sellable, so rows carrying
a caveat show "read the note" in ochre.

**Two gate failures, both fixed rather than shipped past.** The subject row's tinted ground drops
`--muted-2` to 4.45:1 against the 4.5 AA threshold — it uses `--muted` at 5.07:1. And the strip
labels were 9px against a site that has nothing below 11.5px; all eighty `audit.py` findings were
this chapter's, and they now use the site's own micro size.

**Angus's steer on the form, not yet built:** a card grid with tabs for the United Kingdom and
Europe, rather than the current grouped list. The data pack is form-agnostic — `MARKET` carries
the hotels and `marketIndexHTML()` is the only thing that would change — so this is a swap, not
a rebuild.

**The pack cannot drift.** `Research/cohort-2026-08/build_market_pack.py` produces
`market-web-data.json` deal-side from the collected series; `tools/inline-market.py` splices it
between the MARKET-DATA markers and caches `src/market-data.json`. Same shape as capex and the
P&L pack. Routes were added to `snap.py` and `audit.py`, which both carry their own hardcoded
route lists.


## Chapter 10 becomes a card grid (19 August 2026)

Angus's steer, built. The grouped list is gone; the chapter is now a card grid under two tabs,
and every card leads somewhere.

**Two tabs, Europe first — 27 hotels against 8 and the subject.** Europe opens first so the
reader meets the rate ceiling before the British set that sits well below it. Fawley Court is
pinned to the head of its band in **both** tabs, never sorted into them, so the subject is
present whichever tab is open.

**Level two is what kind of place each property is**, not its calendar: country estate, coast
and island, palace town and village, lakeside, alpine. The grouping is the portal's own reading
of the setting each research pack records, and the source note says so on its face. It carries a
finding the old list could not: **every British comparable is a country estate, and the European
set falls into five kinds of place** — so the Amalfi and Costa Smeralda hotels, whose economics
are a different business, no longer sit in the same run of rows as the estates Fawley is one of.
Inside each band the ruled order holds: months open, then rate.

**Ordering had to survive the form.** A grid reads in rows and states its order far less
strongly than a list. The bands are what carries it — a labelled band of eight estates ordered
by rate says what an unlabelled column of thirty-five cannot. A sort control was considered and
rejected: a sortable grid reads as a league table, and the calendar order is the argument.

**Three card treatments, one DOM, chosen by `html[data-mkcard]`.** Ledger, four across, the
index as a ruled sheet. Calendar, three across, the twelve-month strip as the largest object on
the card. Plate, three across, the rate set large as the card's first object with the calendar
as a twelve-mark meter. The switcher is gated behind `?variants=1`, persisted, cleared by
`?variants=0`, and URL-addressable as `?variants=1&card=plate`. **When the treatment is chosen
the other two are deleted, the harness comes out, and this entry records which and why.**

**No expansion, by ruling.** The old rows opened in place onto their rate detail. Angus ruled
the cards link out instead: ten to their written case study, twenty-five to a property page of
their own. The consequence was named and accepted — **the rate evidence for those twenty-five
comes off the portal** until their pages are written, because he ruled those pages a true
placeholder: name, place, months bookable, median gross and net of VAT, and a line saying the
case study is not yet written. Writing the twenty-five out properly is the follow-on.

**The ten case pages gained a third tab, "Rate record"** — the collected series, the quartiles,
the range, peak to trough, the bookable nights, the longest unbookable run, the meal basis, and
which engine it came from and when. Every destination now reads the same way. Nothing gated in
those pages was touched: the new tab is rendered from the market pack, and gated against it.

**The pack now carries the grouping.** `build_market_pack.py` emits `slug`, `type`, `case_slug`,
`type_labels` and `type_basis` alongside the rate layer, so the page invents nothing. The names
also gained their accents — Château de la Messardière, Le Grand Contrôle, Domaine des Étangs —
which the case studies already carried and the pack did not.

**The pack is now actually gated.** The 18 August entry said `verify.mjs` checked the shipped
block against its source; it did not — there was no market section in the file at all. Section G
is now there: the shipped pack equals the source leaf for leaf, every figure on every card is
`verify.mjs`'s own independent formatting of that source checked against the rendered HTML of
both tabs, the index, tab and band counts are the source's counts, every card leads to a route
that resolves, the basis prose is the pack's own wording, and the ten rate records print the
source's series. 5,908 checks, 0 failures, 292 of them market figures. The gate was
negative-tested: a single digit changed in the shipped median fails it twice.

**A second session was in the repo during this build.** The Son Bunyola collection landed
while the grid was being audited, and the pack was rebuilt and re-inlined mid-run: the audit's
first three viewports counted 28 cards on the Europe tab and its last counted 29. Nothing was
lost — the renderer was untouched and both packs agreed — but the counts in `verify.mjs` and
`audit.py` are now **derived from the pack** rather than written as literals, so a hotel joining
the set cannot leave a stale number in a gate. The set is 36 hotels: Son Bunyola is in it, and
the pack carries a villas layer that nothing renders yet.

**Four dead CSS tokens found and removed.** The old chapter styled itself with `--rule`,
`--rule-2`, `--sp-3` and `--sp-6`, none of which exist in this file, so those rules never
applied. The new block uses `--line`, `--line-mid` and the real spacing. A new token, `--ochre`
at `#8a5f13`, carries the caveat lines at 5.5:1 on paper and 4.97:1 on the subject's tinted
ground; the old inline `#9a6b16` was 4.57:1, inside AA but with nothing to spare.

## The card becomes a photograph and the figures we hold (19 August 2026)

Angus's second pass on chapter 10, and it settles the treatment: **calendar, with the graph
taken out and a photograph in its place. Ledger and plate are deleted, and the `?variants=1`
harness with them** — one card style, one DOM, no switcher. The kill rule did its job: the
options existed for one review cycle and the losers went the same day.

**Fawley Court is out of the index by ruling.** The chapter is now the market, not the market
with the subject inside it. `verify.mjs` fails if the subject reappears.

**The card carries what the hotel actually discloses.** A photograph, the name and place, the
lead-in rate gross and net of VAT, how many of the twelve months it is bookable, and then the
headline figures held on that property: an achieved rate, occupancy, margin, payroll, revenue a
key, what it was built for, what it last traded at. Each row prints its evidence class — filed,
press, interview, derived, modelled, note — and each row's **basis is printed in full on that
hotel's own page**, not on the card, so the card stays readable and the evidence is one tap
away.

**Twenty-eight of the thirty-six disclose something; eight disclose nothing at all.** Those
eight say so on the card — "nothing beyond a rate and a calendar is published, and nothing was
found in the registries" — rather than showing an empty frame. The lede states the count and
the gate checks it against the pack, so it cannot go stale.

**The figures are a new layer in the pack, not page furniture.** `build_market_pack.py` carries
a curated table of 72 figure rows across 28 hotels, each with its value, its basis and its
class, assembled from `Research/cohort-2026-08/FINDINGS.md` (the filing gate, the comparative
table, the payroll finding, the occupancy sweep, the capex sweep, the transactions),
`Research/comp-pnls/web-data.json` filed evidence, and the memorandum's own UK operating and
transaction evidence. 41 rows are filed, 19 press, 5 derived, 4 modelled, 3 a note. The
Continental filed figures reach us through registry aggregators surfacing deposited filings
rather than the filed documents, and the chapter says so.

**One figure was deliberately dropped.** The estimated P&L's occupancy assumption for Cliveden —
the UK luxury segment average — is an assumption about the segment, not evidence about the
hotel, and it would have read as Cliveden's own. Only evidenced occupancy is shown: eight
properties.

**Photography: 36 images, collected by four agents in parallel, and every one checked by eye
against a contact sheet before it shipped.** Fifteen are Creative Commons or public domain;
twenty-one are the hotel's or group's own imagery, whose **republication rights are not
cleared** — the portal is private and the photographs identify the property rather than
illustrate a publication. Each image carries its credit, its licence and its own note in the
caption on the hotel's page, and the notes are honest about the weak ones: Reschio's Commons
photograph predates the restoration, Le Grand Contrôle's predates Airelles, Le Sirenuse could
only be had as a Positano view and Villa La Coste as a pool with the building behind. Commons
was searched and has nothing better for either.

**7.3MB of photography is not warmed on every visit.** The images load lazily as a reader
scrolls the chapter, and the rest of the set warms once, on idle, the first time chapter 10 is
opened in a session — the architecture ruling's principle applied to weight rather than to code.

**The gate grew with the chapter**: 6,408 checks, 0 failures. Section G now also checks that
every headline figure on a card is the pack's own with its class, that its basis is printed on
that hotel's page, that every photograph named is on disk and carries its credit and licence,
that no photograph belongs to a hotel outside the set, and that the subject stays out.

## The dead right half, and what chapter 10 looks like now (19 August 2026, later)

Angus circled the defect by name: a paragraph capped at a measure inside a full-width
container, leaving half the page empty. It is a systematic LLM failure — the typographic rule
("45–75 characters") survives training as a decontextualised instruction while the composition
half of the job does not, and the defect is invisible in the CSS because `max-width: 74ch` is
correct in isolation. It only exists in the render. **The rule is now in the global instruction
file**, and the portal's own design context already carried the warning, which is worse: it was
written down and shipped anyway.

**Where it was, and what it is now.** The chapter's lede ran at 74ch with nothing beside it: it
now sits in a two-column head, prose left, the set's own three counts right — how many are
bookable in all twelve months, how many publish nothing at all, how many kinds of place there
are. The source notes were the same ribbon: they now run in three columns across the full
width. On a hotel's page the whole composition was a left column with a dead right side; it is
rebuilt on the comparables deck's own model — the name and its figures on one rule, then the
photograph against what the property discloses, then the rate series across the width, with the
nine record rows in two columns rather than one narrow list.

**The card, second revision.** Four across rather than three, the photograph unchanged, and the
rate now hangs against the name on one line with the net-of-VAT figure against the place
beneath it — the deck's own convention, and it makes the grid scan as a rate table with
pictures.

**Filters, on Angus's specification.** Three tabs — All, Europe, the United Kingdom — with All
first and default. Choosing Europe opens a country row beneath (Italy 15, France 8, Ireland 2,
Austria 1, Spain 1, Greece 1); the kind-of-place filter sits opposite it on the same line, and
its counts recompute against whatever is selected, so the pair is always honest about what it
is showing. Choosing a tab clears the country.

**Seven photographs replaced** — Reschio (the restored castle rather than a 2008 pre-conversion
Commons photograph), Castello di Casole, Villa La Coste, Borgo Egnazia, Il Pellicano, La Réserve
Ramatuelle and Hôtel du Cap-Eden-Roc (the Eden-Roc pavilion and its sea-cut pool, and the only
one of the seven with a clean Creative Commons source). Six of the seven came from the hotel's
own site because Commons holds nothing usable. La Réserve's replacement has a person on the
terrace, flagged in its caption; it is still a clear improvement on the entrance canopy it
replaces.

**Three defects the render caught and the code could not.** The filter labels used the class
`.lb`, which is the lightbox's own class, so the global lightbox rules made them invisible —
renamed `.fl-l`. The filter chips computed to a fraction under the 44px touch floor at iPad
portrait and now sit at 46px. And the photography warm-up used `let` in a block the router
reaches before it is evaluated, which threw on every load of the chapter; it is `var` now.
`audit.py` also had to learn that the default tab is All, and it now exercises the country and
type filters as well.

## The chart, the chips, and what came out (19 August 2026, evening)

**The head block is cut.** The lede and the three counts beside it are gone on Angus's ruling;
the reason the chapter is ordered the way it is now sits in the source note at the foot, where
the rest of the basis lives.

**Both filter groups sit on one line.** The kind-of-place label is gone, and every chip — country
and type alike — is 72px wide, the width the narrowest chip already was, with the label free to
wrap over two lines and the count beneath it. The type names shorten for the chips only
(`type_labels_short` in the pack: "Coast & island", "Palace & town"); the band headings keep the
full names. Where there is no country group — the All and United Kingdom tabs — the type chips
start at the left rather than hanging in space.

**The twelve monthly bars are gone, replaced by the rate year as the comparables deck draws
it.** The bars existed because the pack only carried twelve monthly medians; the nightly series
sat in `staging/` and was never brought through. It is in the pack now — a comma-separated run
over the collection window, cleaned on the same convention as the medians, blank where nothing
was bookable — and each hotel's page draws it as a line across the year with the median dashed
over it, a £ axis, month marks, and a caption naming how many nights it rests on and how many
the cleaning rule dropped, with the raw peak. Messardière's chart is the argument in one
picture: sixteen nights of line in September and October and eleven empty months.

The pack grows from 37KB to 92KB for the nightly data, which gzips well and is worth it: the
chart is now drawn from what was collected rather than from a summary of it.

**The kind-of-place filter takes the region tabs' own form** (19 August, later still): same
underlined tab, same baseline, same line, at seven tenths the type size and right-aligned
against the three region tabs. The chips are gone from it; the country filter keeps them on its
own line beneath, where it appears only on Europe. One deviation from "30% smaller", stated
rather than silently applied: the count would land at 8.4px, under the portal's own 11.5px type
floor, so it holds at the floor while the label shrinks. The narrow "All" tab also carries a
46px minimum width, because at seven tenths it measured 31–39px against the 40px touch minimum.

## The set shrinks to 34, and the chapter tightens (19 August 2026, night)

**Two hotels are out of the comparable set by ruling.** Danesfield House is no longer a
comparable. Domaine des Étangs prices at £522 — checked before cutting, and the figure is real:
147 bookable nights over six months, the cheapest in the set by a distance and well below the
band this cohort exists to bracket. The set is 34: Europe 27, the United Kingdom 7, ten bookable
in all twelve months. Their photographs and records went with them.

**The set always sorts by rate now**, not by calendar then rate. The bands remain.

**The card carries four rows and no more.** The achieved rate and the season come off it, the
caveats come off it, and anything past the fourth row folds behind a control on the card itself.
That forced a structural change: a card is a div with a stretched navigation button underneath
and the fold control above it, because a button inside a button is not valid HTML and does not
work.

**The chapter's source note is cut.** The basis, the VAT note and the evidence-class definitions
print on each hotel's own page, where the figures they describe are, and the gate checks them
there.

**The kind-of-place and country filters are the same object now**: small tabs at seven tenths
the region tabs' size, bottom-aligned to the same baseline, 76px wide with the label wrapping and
the count trailing its last line, right-aligned. Countries appear only on Europe, on their own
hairline beneath.

**Five more photographs.** Le Grand Contrôle now uses the plate from Align's own comparables
deck. Villa San Michele, Hôtel du Cap-Eden-Roc and Rosewood Schloss Fuschl found clean Creative
Commons replacements; Borgo Egnazia is the clock tower of La Corte from the resort's own press
room, because Commons holds nothing of the hotel.

**The bands are gone and the grid is one rate-ordered list** (19 August, night): the kind of
place is what the filter is for, so it no longer heads the grid as well. Cards size to their own
content rather than stretching to the tallest in the row, which was leaving a dead foot under
every short card. The gate now checks the grid's order directly — every tab's cards, in rate
order, against the pack's own sort.

## Season, motion, and the fold removed (19 August 2026, late)

**The card's first row is the hotel's season, not our own month count.** Angus caught the defect
on Pitrizza, which read "2 of 12 months" because the collection window ran in August: its
published 2026 season is 29 May to 28 September. All 34 now carry a season — eight from the
cohort research, eighteen from a season sweep run for this, and eight year-round on our own
evidence, each with its basis and evidence class. Splendido is the one that could not be pinned:
two current listings disagree by more than a month at both ends, and the card says so rather
than picking one.

**The fold is gone.** A card shows four rows and no control; everything else is on the hotel's
page, which is where the basis for each figure already lives.

**Motion, three moments.** The portal already staggered its sections in. Leaving a view now
fades before the next is written, so a route change reads as one movement; a filter change fades
the grid rather than swapping it under the eye, and the cards stagger back in; and the rate line
draws itself once, left to right, with the median arriving after it. Transform, opacity and
stroke only — nothing that lays out — and the whole layer is off under prefers-reduced-motion.
The line uses `pathLength="1"`, so the draw needs no measurement in script.

## One template for every hotel (19 August 2026, night)

Ruled: the ten written case studies and the twenty-four property pages converge on a single
template, and **a hotel that holds more is never cut down to the poorest one** — each section
renders only if there is something to put in it. The order is fixed: the name and its figures on
one rule; the photograph against an intro paragraph and what the property discloses; the property
record beside what happened, what it earns and what it evidences; the read against the
underwrite; the rate year; the sources. The ten keep their estimated P&L as a second tab and keep
their case number and layer in the eyebrow.

**Every page opens on prose, not on fact.** The intro paragraph sits above the disclosure table
by ruling, so a page never begins cold with a figure. The ten have their case text; the intros
for the rest are the first thing the per-hotel research writes.

**The shared measures are in one place** — `--hp-sec`, `--hp-gap` and the `.hp-*` block — so
spacing, structure and the split of every paired block change once for all thirty-four.

The written layer is read from `HOTELPAGE[slug]` where it exists and from the memorandum's own
case studies for the ten, so the gate on the memorandum's words still holds and nothing was
retyped.

**A second session was in this repo throughout**, moving the capital-cost chapter to a v28 model
pack. Its in-flight state failed the shared gate for about twenty minutes; this work waited
rather than pushing through it or patching another session's chapter, and went out once its own
gate cleared.

## The restructure of 20 August 2026

Angus's feedback, taken in one pass. What it removed, what it built, and the
judgments taken inside it.

**The contents rows are all one height.** Every description is held to two lines
and the headline figures run across rather than stacking, so a chapter with three
of them cannot outgrow one with two. A row that grows because its blurb ran on
reads as emphasis it has not earned; the contents is a rhythm.

**The Ultra Luxury Market lost two tabs and gained one.** The Comparable
Architecture and Seasonality are cut. Sales Evidence & Exit Yield moves in from
the Underwrite and now carries the European transaction evidence as well as the
United Kingdom trades. Six tabs: the index, rate, operations, conversion capex,
sales evidence, the estimated P&Ls.

**Rate is a table by default and the field behind a button.** The question that
arrives at this tab is usually about one property in one month, and that is a
table; the second question is where the underwritten rate sits in the whole
field, and that is the chart. Both read the pack, and both take the index's own
filters — region, country and kind of place — from one piece of state, so the
two surfaces cannot show different sets. The field's domain follows the filtered
set rather than a fixed £3,000 ceiling, so filtering to the United Kingdom no
longer leaves four fifths of the axis empty; it plots the middle half of each
collected year, P25 to P75, with the median marked.

The deck-authored eleven-row rate field is retired with it, and its gate with it.
The replacement is pack-driven, so the market chapter's own gate covers it.

**The Underwrite is six tabs.** Assumptions, Capital, Residences, the IRR Bridge,
Summary Financials, Returns & the Entry Ladder. The Dial Set, Revenue Engines and
the Margin Frame are cut; Capital & Cost to Open is folded into Drawdown, which
becomes Capital; the two residences tabs are one; the Cases and the Single-Lever
Sensitivities are cut.

**The Dials become Assumptions, and the sheet is the master.** Thirty
assumptions in eight groups, generated from the measured record by
`tools/build-blocks.py` rather than typed, each carrying its class — Decision,
Market or Output — its basis, and what moving it alone is worth to the levered
return. That last column is the single-lever sensitivity work: cutting the tab
would have lost it, so it travels with the assumption it belongs to instead, and
no assumption is now read without its consequence. The bar's own sheet reads the
same thirty, so the two cannot drift.

The gate holds the shape rather than the strings: thirty rows, eight groups in
order, none empty, a known class on each, forty-one model figures readable off
this one surface, and every printed swing recomputed against the record's own
sensitivity run.

**The Summary Financials head is a spine, not eight tiles.** Four figures answer
the deal — what it costs, what it costs to open, what it exits at, what it
returns — at full size, and four qualify them under a rule. A grid of eight equal
boxes gives no reading order at all. Both summary tables end on their answer
column, the stabilised year and the whole hold, tinted and ruled off so the eye
lands on it rather than counting across. Competitive Position is cut, and the
cash flow's explanation lines with it: the basis is the assumptions sheet's job.

**Two panes are two tracks again.** Every use of the paired-pane block passes its
own `--split`, and the variable had stopped being read, so a pair of
two-column tables ran the full width with the labels and the amounts at opposite
edges. Honoured again from 1000px. Six views were affected; the merged Capital
tab was the one that made it visible.

**Our own file paths are not evidence.** The rebuilt evidence tables cite the
filing, the registry and the year. The first render printed
`Research/cohort-ops-airelles-france.md` on a client-facing page, and the builder
now strips every such path.

### What the audit caught that the figure gate could not

Retiring the old rate field's table toggle also removed the click handlers that
sat under it: the diligence register's filters, the whole capital-cost
schedule's filters and line expanders, and the in-page anchor links. Every
figure still verified; 8,656 checks passed on a page whose two biggest
interactive surfaces were dead. `audit.py` found it in one run. **The figure gate
and the behaviour audit are not substitutes, and a change that deletes code has
to run both.**

### The gate now checks arithmetic, not just membership

The evidence tables print filed absolutes and the ratio struck on them, and a
ratio is a calculation rather than a figure to be looked up. `verify.mjs`
recomputes all 38 of them, recomputes every currency conversion at the research
convention, and accepts a token whose numeral is a rounding of a number the
research estate states. The research estate — the operations packs, the Belmond
tables, the hotel pages, the transaction database and the cohort's staging layer
— is a registered source in its own right from this date.

### A second session, again

The estate-model session was in this file throughout, adding an Estate Model
chapter and an untracked 86MB `model/` folder. Angus confirmed it. This commit
carries this work only and leaves that chapter out of the committed version,
because its assets are not in the repository and the deployed page would fail on
them; the working tree keeps it untouched for that session to ship itself.
