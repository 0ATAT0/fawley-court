# Fawley Court — Investment Memorandum

The whole memorandum as an installable, offline-capable web document: nine
chapters, ten case studies, the IRR bridge, the vendor-question register and the
investor cheat sheet, readable one-handed on an iPad in a meeting.

Align-branded. Strictly private and confidential. Two chapters are internal and
are badged as such on the page, in the chapter bar and in the contents.

## The section map

| # | Chapter | What it holds |
|---|---|---|
| 01 | Executive Summary | The landing view: cover, the four headline figures, the summary table and the contents |
| 02 | The Asset | The estate and its designations · photography (two plates pages, lightbox) · title and ownership · planning and consents · the scheme · counterparty and the price question |
| 03 | Evidence & Comparables | The comparable architecture · cohort rate ladder · UK rate evidence · rate positioning (interactive field) · seasonality · cohort operations · UK operational evidence · conversion capex · the ten case studies |
| — | Case study, ×10 | `#/h/<slug>` — the property record, what it evidences, and a line-by-line read against the underwrite |
| 04 | The Underwrite | The dial set · revenue engines · the margin frame · capital and cost to open · drawdown and return profile (equity waterfall) · residences, adopted product and sold evidence |
| 05 | Returns & the Entry Ladder | Returns, cases and the floor · exit yield and value per key · the entry ladder (interactive) · single-lever sensitivities |
| 06 | The IRR Bridge | The seven-lever walk from the Embassy base case to the Align underwrite, waterfall + table + reading + the caveats panel |
| 07 | Diligence | The underwrite against the data room · diligence gates and the information register |
| 08 | The Fawley Questions | **INTERNAL** — 87 questions filterable by status and section, collapsible detail, the 39-item ask list, the tags/keys/counts view |
| 09 | The Cheat Sheet | **INTERNAL** — the one-page IC reference: hero tiles, summary P&L, cash-flow walk, sources and uses, returns, sensitivity grid, transaction comps, terms, watchpoints |

Navigation: a fixed masthead, a chapter bar pinned to the bottom (chapter chips,
a Contents sheet and a Dials sheet), a sticky section rail on wide screens and a
scrolling jump row on narrow ones, and prev/next pagers on every chapter.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole document — inline CSS and JS, hash-routed, no build step |
| `manifest.json`, `sw.js` | PWA: installable, network-first for the page, cache-first for assets (`fawley-court-v1`) |
| `align-mark.png` | Align wordmark, strapline cropped |
| `icon-192/512.png`, `apple-touch-icon.png` | Home-screen icons |
| `img/*.jpg` | Vendor data-room photography, resized (`-t` = 640px thumb, plain = 1200px) |
| `verify.mjs` | The content gate — every figure on the page against its source |
| `tools/parse-qs.py` | Parses the vendor-question register markdown into `src/qs-data.json` |
| `tools/inline-qs.py` | Splices that JSON into `index.html` between the `QS-DATA` markers |
| `src/cheatsheet-render.txt` | Text extract of the cheat sheet's own PDF render — the source of every measured value on chapter 09 |
| `snap.py`, `audit.py`, `offline.py` | Render, polish-audit and offline harnesses |
| `snaps/` | Rendered screenshots, four viewports, every route (gitignored) |

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
node verify.mjs      # 2,299 checks against the four sources — must PASS
python audit.py      # touch targets, contrast, overflow, type floor, console — must print "clean"
python offline.py    # service worker takes control; every route renders offline
python snap.py v     # renders every route at four widths into snaps/
```

## Sources of record

Nothing on this page is re-derived, re-rounded or updated. Every figure is
carried verbatim from one of five files, and `verify.mjs` gates each of them:

| Section | Source |
|---|---|
| Chapters 01–07, the case studies | `Deck/im-v1/slides.md` and `Deck/im-v1/figures.json`, governed by `Deck/im-v1/INTENT.md` |
| Chapter 06, the bridge | `Model/docs/embassy-bridge-20260816.md`, with the standing bridge page's prose |
| Chapter 08, the register | `Research/vendor-qs-crosscheck-20260816.md` |
| Chapter 09, the cheat sheet | `Model/cheatsheet-spec.json` for every label and note; the sheet's own render for every measured value |

If the underwrite moves, the deck and the model records move first and this page
follows. No workbook is opened by anything in this repository.

### Regenerating the register

```
python tools/parse-qs.py     # re-parse the markdown; prints the per-section tie-out
python tools/inline-qs.py    # splice it into index.html
node verify.mjs              # confirms the page block equals a fresh parse
```

## House rules the page keeps

- Vendor-readable register throughout: facts with a document and page citation,
  no verdict labels, no promotional adjectives.
- Occupancy is narrated as the 60–70% interval; 0.65 appears only as the model
  input, and the verifier fails on any other use.
- The internal chapters are present, not hidden, and are badged in three places:
  the masthead rule, the chapter chip and a bar at the top of the chapter.
- The price-logic candour of the memorandum is carried in full: the ruled £50m,
  the entry ladder, the backsolves and the sensitivities.
