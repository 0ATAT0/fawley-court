# Fawley Court — the deal portal

Everything needed to be the expert on the deal, the underwrite and the
competitive environment, in one installable, offline-capable page. It is judged
by how fast it answers a question you arrive with, so every surface leads with
the thing itself — table, ladder, chart, register — and the argument folds
behind a "reasoning & basis" rule beneath it.

Align-branded. Strictly private and confidential.

## How it is arranged

- **The landing page is the contents, and the contents is the summary.** Nine
  chapter rows, each with its one-line description and its headline figures.
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
  the capital-cost schedule, every section's own table content, the sixteen
  dials, the entry ladder, the bridge levers and the watchpoints — and lands on
  the answer, opening the question or the cost line it found.

## The map

| # | Chapter | Views |
|---|---|---|
| 01 | Executive Summary | one view: the four headline figures and the eight-row summary |
| 02 | The Asset | estate card (photo strip + key facts) · photography · title & ownership · planning & consents · the scheme · counterparty & the price question |
| 03 | Evidence & Comparables | rate positioning + the ten-case grid · the two layers · cohort rate · UK rate · seasonality · cohort operations · UK operational evidence · conversion capex · **estimated P&Ls** |
| 04 | The Underwrite | the sixteen dials · the dial set · revenue engines · the margin frame · capital & cost to open · drawdown & return profile · residences, adopted product · residences, sold evidence |
| 05 | The Capital Cost | the build-up · **the 146-line works budget, filterable, every line with its basis** · buildings & the estate · **the programme, zone by zone, and what it spends** · residential · what is not in it |
| 06 | Returns & the Entry Ladder | returns strip + the interactive ladder · the cases · single-lever sensitivities · exit yield & value per key |
| 07 | The IRR Bridge | one view: the seven-lever walk, its table, and the reading and limits folded under it |
| 08 | Diligence | the 87-question register · the 39-item ask list · tags, keys & counts · the underwrite against the data room · diligence gates · in closing |
| 09 | The Cheat Sheet | one view: the one-page IC reference |
| — | Case study, ×10 | `#/h/<slug>` — the record and the read-against, and `#/h/<slug>/pnl`, its estimated P&L |

Routes are `#/`, `#/c/<chapter>[/<view>]` and `#/h/<slug>[/pnl]`. Navigation is
a fixed masthead with the finder, a chapter bar pinned to the bottom (chapter
chips, a Contents sheet and a Dials sheet), a sticky tab strip per chapter and
prev/next pagers.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole portal — inline CSS and JS, hash-routed, no build step |
| `manifest.json`, `sw.js` | PWA: installable, network-first for the page, cache-first for assets (`fawley-court-v3`) |
| `align-mark.png` | Align wordmark, strapline cropped |
| `icon-192/512.png`, `apple-touch-icon.png` | Home-screen icons |
| `img/*.jpg` | Vendor data-room photography, resized (`-t` = 640px thumb, plain = 1200px) |
| `verify.mjs` | The content gate — every figure on the page against its source |
| `tools/parse-qs.py` | Parses the vendor-question register markdown into `src/qs-data.json` |
| `tools/inline-qs.py` | Splices that JSON into `index.html` between the `QS-DATA` markers |
| `tools/inline-pnl.py` | Splices the comparable-P&L pack in between the `PNL-DATA` markers, and caches it at `src/pnl-data.json` |
| `tools/inline-v16.py` | Splices the v16 figure record in between the `V16-DATA` markers |
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
node verify.mjs      # 5,500+ checks against the sources — must PASS
python audit.py      # touch targets, contrast, overflow, type floor, the finder,
                     #   the filters, the ladder, the ranking, the lightbox — must print "clean"
python offline.py    # service worker takes control; every route renders offline
python snap.py v     # renders every route at four widths into snaps/
```

`audit.py` forces every disclosure open before it measures, so the folded
argument is audited as hard as the exhibit above it.

## Sources of record

Nothing on this page is re-derived, re-rounded or updated. Every figure is
carried verbatim from one of six sources, and `verify.mjs` gates each of them:

| Section | Source |
|---|---|
| **Every figure on the v16 basis** | `Model/docs/v16-figures.json` — the measured record, struck on Financial Model v16 on 18 August 2026 and spliced in whole |
| **The capital cost, chapter 05** | `Model/capex/capex-web-data.json` — the 146-line schedule as the model holds it, with `REGISTER.md` and `PROPOSAL.md` behind the prose |
| Asset, planning, evidence and the case studies | `Deck/im-v1/slides.md` and `Deck/im-v1/figures.json`, governed by `Deck/im-v1/INTENT.md` |
| Chapter 07, the bridge | `Model/docs/embassy-bridge-v16-20260818.md` |
| Chapter 08, the register | `Research/vendor-qs-crosscheck-20260816.md` |
| Chapter 09, the cheat sheet | `Model/cheatsheet-spec-v16.json` for every label and note; the sheet's own A3 render for every measured value |
| The estimated P&Ls | `Research/comp-pnls/web-data.json`, carried whole, with the candour lines verbatim from `Research/comp-pnls/REGISTER.md` |
| The portal's own navigation copy | written for the medium; the words are ours, and every figure token inside them is checked against the registers above |

If the underwrite moves, the model records move first and this page follows. No
workbook is opened by anything in this repository.

**The portal is on Financial Model v16; the printed memorandum is still on v15.**
The re-strike of 18 August 2026 moved every model figure here onto v16, which
charges the operator's base and incentive fees inside the P&L (so NOI and its
margin are after them) and rebuilds the capital cost from 146 ground-up lines.
The memorandum PDF has not been re-struck, and the portal says so on its face.

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
- The estimated P&Ls are estimates of other people's businesses. Every one
  carries its evidence class, what is fact and what is inference, and the build
  record's own caveat lines; the comparative view carries all thirteen limits.
- The price-logic candour of the memorandum is carried in full: the ruled £50m,
  the entry ladder, the backsolves and the sensitivities.
