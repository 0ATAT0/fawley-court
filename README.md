# Fawley Court — the deal portal

Everything needed to be the expert on the deal, the underwrite and the
competitive environment, in one installable, offline-capable page. It is judged
by how fast it answers a question you arrive with, so every surface leads with
the thing itself — table, ladder, chart, register — and the argument folds
behind a "reasoning & basis" rule beneath it.

Align-branded. Strictly private and confidential.

## How it is arranged

- **The landing page is the contents, and the contents is the summary.** Five
  chapter rows, each the same height, with its description and its headline
  figures.
- **A chapter is a hub.** It opens with its lead exhibit, carries a tab strip of
  its views, and — where it has more than one — an index of them with a figure
  each.
- **A view is one screen.** The exhibit leads; the ledes, cards, bullets and
  source lines that argue it sit inside a disclosure under it. Nothing is
  deleted, so the verbatim text stays in the DOM and every gate still reads it.
- **Prose composes beside its exhibit.** Two-track grids hold body prose at
  about 70ch and give the second track to the sources, the headline figures or
  the second table, so no paragraph is left as a ribbon beside dead space.
- **A site-wide finder** (`/`, ⌘K, or the masthead ⌕) searches the 87 questions,
  the 39 asks, the ten case studies and their estimated P&Ls, the 146 lines of
  the capital-cost schedule, every section's own table content, the thirty
  assumptions, the entry ladder, the bridge levers and the watchpoints — and lands on
  the answer, opening the question or the cost line it found.

## The map

| # | Chapter | Views |
|---|---|---|
| 01 | The Asset | estate card (photo strip + key facts) · photography · title & ownership · planning & consents · the scheme · counterparty & the price question |
| 02 | The Ultra Luxury Market | the 34-hotel index · **rate, every annual and monthly figure held, as a table or as the lead-in field** · operations · conversion capex · **sales evidence & exit yield** · estimated P&Ls |
| 03 | Underwrite | **the thirty assumptions** · capital & the drawdown · residences · the IRR bridge · summary financials · returns & the entry ladder |
| 04 | The Capital Cost | the build-up · **the works budget, filterable, every line with its basis** · estate areas · the programme · residential |
| 05 | Diligence | the 87-question register · the 39-item ask list · tags, keys & counts · the underwrite against the data room · diligence gates · in closing |
| — | Hotel page, ×34 | `#/h/<slug>` for the ten written cases and `#/m/<slug>` for the rest, plus `#/h/<slug>/pnl`, the estimated P&L |

Routes are `#/`, `#/c/<chapter>[/<view>]`, `#/h/<slug>[/pnl]`, `#/m/<slug>` and
the advanced estate exhibit `#/c/capital/areas[/<area>]`. Navigation is a fixed
masthead with the finder, a chapter bar pinned to the bottom (chapter chips, a
Contents sheet and an Assumptions sheet), a sticky tab strip per chapter and
prev/next pagers. `#/c/returns/*` and `#/areas` redirect to where their views
now live.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole portal — inline CSS and JS, hash-routed, no build step |
| `areas.js` | Deferred estate-areas chapter — fetched only for `#/areas`, then reads `src/areas-data.json` and warms its CGIs |
| `manifest.json`, `sw.js` | PWA: installable, network-first for the page, cache-first for assets (`fawley-court-v3`) |
| `align-mark.png` | Align wordmark, strapline cropped |
| `icon-192/512.png`, `apple-touch-icon.png` | Home-screen icons |
| `img/*.jpg` | Vendor data-room photography, resized (`-t` = 640px thumb, plain = 1200px) |
| `verify.mjs` | The content gate — every figure on the page against its source |
| `tools/parse-qs.py` | Parses the vendor-question register markdown into `src/qs-data.json` |
| `tools/inline-qs.py` | Splices that JSON into `index.html` between the `QS-DATA` markers |
| `tools/inline-pnl.py` | Splices the comparable-P&L pack in between the `PNL-DATA` markers, and caches it at `src/pnl-data.json` |
| `tools/inline-model.py` | Splices the measured figure record in between the `MODEL-DATA` markers |
| `tools/inline-cheat.py` | Splices the cheat-sheet pack in between the `CHEAT-DATA` markers |
| `tools/build-blocks.py` | Regenerates the figures map, **the thirty assumptions**, their source line, the ladder, the bridge and the equity waterfall from the record. `--check` reports whether the page has drifted from it |
| `tools/restrike-hotelpages.py` | Re-strikes the underwrite's own figures in the hotel pages' staging files |
| `tools/inline-capex.py` | Splices the capital-cost pack in between the `CAPEX-DATA` markers |
| `tools/dump.mjs` | Dumps the page's own data structures as readable text, for inventory work |
| `tools/shot.py` | One route, one viewport, at full scale — for reading a region rather than a page |
| `src/cheatsheet-render.txt` | Text extract of the cheat sheet's own PDF render — the source of every measured value on chapter 08 |
| `snap.py`, `audit.py`, `offline.py` | Render, polish-audit and offline harnesses |
| `snaps/` | Rendered screenshots, four viewports, every route (gitignored) |
| `DECISIONS.md` | The structural rulings this arrangement rests on |

Every reference in the page is relative (`./`), so it serves correctly from a
repository sub-path such as `/fawley-court/`.

## Serve it locally

```
cd fawley-court
python -m http.server 8732 --bind 127.0.0.1
```

Then `http://127.0.0.1:8732/`. The service worker registers on `localhost` and
on HTTPS only, so offline behaviour is testable locally.

## The gates — run all four before shipping any content change

```
node verify.mjs      # 8,600+ checks against the sources — must PASS
python audit.py      # touch targets, contrast, overflow, type floor, the finder,
                     #   the filters, the ladder, the ranking, the lightbox — must print "clean"
python offline.py    # service worker takes control; every route renders offline
python snap.py v     # renders every route at four widths into snaps/
```

`audit.py` forces every disclosure open before it measures, so the folded
argument is audited as hard as the exhibit above it. **Run it on any change that
deletes code.** On 20 August a retired exhibit took the register and
capital-cost click handlers with it; every figure still verified, and only the
audit saw that two of the page's biggest interactive surfaces were dead.

**Deploy with the commit** (Angus, 19 August 2026). This repository is the live
deal portal, so a commit that passes the gates is pushed in the same turn rather
than held for a separate instruction. Gates first, then commit, then push, then
confirm the deployed page against the source.

## Sources of record

Nothing on this page is re-derived, re-rounded or updated. Every figure is
carried verbatim from one of six sources, and `verify.mjs` gates each of them:

| Section | Source |
|---|---|
| **Every model figure** | `Model/docs/v29-figures.json` — the measured record, struck on Financial Model v29 on 19 August 2026 and spliced in whole. A figure retired with an earlier version fails the gate rather than passing on the strength of the old record |
| **The capital cost, chapter 04** | `Model/capex/capex-web-data.json` — the 146-line schedule as the model holds it, with `REGISTER.md` and `PROPOSAL.md` behind the prose |
| Asset, planning, evidence and the case studies | `Deck/im-v1/slides.md` and `Deck/im-v1/figures.json`, governed by `Deck/im-v1/INTENT.md` |
| The IRR bridge | `Model/docs/embassy-bridge-v29-20260819.md` |
| The diligence register | `Research/vendor-qs-crosscheck-20260816.md` |
| Operations, conversion capex and the transaction evidence | the research estate: the five `Research/cohort-ops-*.md` packs, `belmond-sec-tables.md`, `european-ceiling-cohort.md`, `comp-evidence.json`, `Research/cohort-2026-08/` and its `staging/` layer. Carried by `Research/cohort-2026-08/evidence-rebuild-20260820/build-evidence-views.py`, which parses the research pass's own tables so nothing is retyped |
| Summary Financials | `Model/docs/cheat-web-data.json`, generated from the workbook's own Cheat Sheet tab: every printed value as the sheet renders it, every note from the sheet's off-page register keyed by the cell it annotates |
| The estimated P&Ls | `Research/comp-pnls/web-data.json`, carried whole, with the candour lines verbatim from `Research/comp-pnls/REGISTER.md` |
| The portal's own navigation copy | written for the medium; the words are ours, and every figure token inside them is checked against the registers above |

If the underwrite moves, the model records move first and this page follows. No
workbook is opened by anything in this repository.

**The portal is on Financial Model v29; the printed memorandum is still on v15.**
Every model figure here reads the v29 measured record, which charges the
operator's base and incentive fees inside the P&L (so NOI and its margin are
after them) and builds the capital cost from a 162-line ground-up schedule. The
memorandum PDF has not been re-struck, and the portal says so on its face.

A figure retired with an earlier version fails the gate rather than passing on
the strength of the old record, and a figure the tables derive — a ratio, a
currency conversion, a figure a key — is **recomputed** rather than looked up.

### Regenerating the register and the P&L pack

```
python tools/parse-qs.py     # re-parse the markdown; prints the per-section tie-out
python tools/inline-qs.py    # splice it into index.html
python tools/inline-pnl.py   # splice the comparable-P&L pack in
node verify.mjs              # confirms both blocks equal their sources
```

## House rules the page keeps

- Vendor-readable register throughout: facts with a document and page citation,
  no verdict labels, no promotional adjectives.
- Occupancy is narrated as the 60–70% interval; 0.65 appears only as the model
  input, and the verifier fails on any other use.
- A basis cell names the filing, the registry and the year a reader could check.
  Our own file paths are plumbing and never appear on the page.
- The estimated P&Ls are estimates of other people's businesses. Every one
  carries its evidence class, what is fact and what is inference, and the build
  record's own caveat lines; the comparative view carries all thirteen limits.
- The price-logic candour of the memorandum is carried in full: the ruled £50m,
  the entry ladder, the backsolves and the sensitivities.
