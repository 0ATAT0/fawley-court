# -*- coding: utf-8 -*-
"""The derived old-to-new map for the underwrite's own figures.

Shared by every re-strike tool. For each figure key the live record and a
superseded one both hold, the old value maps to the live value, so the mapping
is by concept and a new version of the model needs no edit here. Written once
because the same map is wanted in three places: the staged hotel pages, the
page's case plates and its evidence tables.
"""
import json, os, pathlib, re, sys
from collections import defaultdict

DEAL = pathlib.Path(os.environ.get(
    "FAWLEY_DEAL_ROOT",
    r"D:\OneDrive - Strand Labs\2. Clients\Align\2. Live Deals\Fawley Court"))
PAGES = DEAL / "Research" / "cohort-2026-08" / "staging" / "pages"
DOCS = DEAL / "Model" / "docs"

# the same resolution every tool uses: the highest-numbered record wins, and
# FAWLEY_MODEL_RECORD overrides it outright.
def resolve_record():
    override = os.environ.get("FAWLEY_MODEL_RECORD")
    if override:
        return pathlib.Path(override)
    hits = sorted((int(re.match(r"v(\d+)-figures\.json$", f.name).group(1)), f)
                  for f in DOCS.glob("v*-figures.json")
                  if re.match(r"v(\d+)-figures\.json$", f.name))
    if not hits:
        sys.exit("no vNN-figures.json in %s" % DOCS)
    return hits[-1][1]

LIVE_PATH = resolve_record()
F = json.loads(LIVE_PATH.read_text(encoding="utf-8"))["fig"]

# a token only reads as a figure if it looks like one; a bare "8" would rewrite
# an honest number somewhere else on the page. Mirrors verify.mjs's FIGURE_LIKE.
FIGURE_LIKE = re.compile(r"^\(?£[\d,.]+[mkbn]?\)?$|^\(?[\d.]+%\)?$|^[\d.]+x$|"
                         r"^[\d.]+bp$|^\d+-line$|^£[\d,]{4,}$")

def build_map():
    """old token -> live token, keyed by the figure it is. A token two records
    disagree about is dropped rather than guessed at, and reported."""
    cand = defaultdict(set)
    for path in sorted(DOCS.glob("v*-figures.json")):
        if not re.match(r"v\d+-figures\.json$", path.name) or path == LIVE_PATH:
            continue
        old = json.loads(path.read_text(encoding="utf-8")).get("fig", {})
        for k, v in old.items():
            new = F.get(k)
            if not isinstance(v, str) or not isinstance(new, str):
                continue
            if v == new or not FIGURE_LIKE.match(v):
                continue
            cand[v].add(new)
    live = set(map(str, F.values()))
    out, ambiguous = {}, []
    for old, news in cand.items():
        if old in live:                 # the model has come back to it
            continue
        if len(news) > 1:
            ambiguous.append((old, sorted(news)))
            continue
        out[old] = news.pop()
    return out, ambiguous

SWAP, AMBIGUOUS = build_map()

# Non-figure corrections that no record can express.
LABELS = [("v16 hotel works", "hotel works")]

# The key count is not figure-like, so it is swapped only where the row says it
# is the key count. Every other bare number in a subject cell is left alone.
KEY_ROWS = {"keys", "key count", "rooms", "keys / rooms"}

# A rounded form of a record figure is in no record, so the derived map cannot
# see it: one subject cell divided the ruled entry by the old key count and read
# £833k a key long after the count moved. Rows that say they are a price a key
# take the live figure, rounded the way the cell writes it.
PRICE_ROWS = ("price per key", "price a key", "price per room")
PPK = re.compile(r"£\d{3}k a key")
PPK_LIVE = "£%.0fk a key" % (float(json.loads(LIVE_PATH.read_text(encoding="utf-8"))
                                   ["raw"]["price_per_key"]["v"]) / 1000)


# Every key count any superseded record held, so "60 keys" inside a subject cell
# moves with the rest of it. The count alone is not figure-like and cannot go in
# SWAP without rewriting honest numbers elsewhere; in this phrase it is safe.
OLD_KEYS = sorted({v for v in (
    json.loads(p.read_text(encoding="utf-8")).get("fig", {}).get("keys")
    for p in DOCS.glob("v*-figures.json")
    if re.match(r"v\d+-figures\.json$", p.name) and p != LIVE_PATH)
    if isinstance(v, str) and v != F["keys"]})
KEY_PHRASE = re.compile(r"\b(" + "|".join(re.escape(k) for k in OLD_KEYS)
                        + r")([- ](?:keys?|key\b))") if OLD_KEYS else None


def sub_cell(s):
    if KEY_PHRASE:
        s = KEY_PHRASE.sub(lambda m: F["keys"] + m.group(2), s)
    for old, new in SWAP.items():
        for a, b in ((old, new),
                     (old.replace("£", "GBP "), new.replace("£", "GBP ")),
                     (old.replace("£", "GBP"), new.replace("£", "GBP"))):
            if a in s:
                s = s.replace(a, b)
    for old, new in LABELS:
        s = s.replace(old, new)
    return s


# Prose names the subject as well as the subject column does. Only a figure
# attributed to Fawley by a possessive is rewritten, so a comparable's own
# number in the same sentence is safe -- Cliveden House traded at £756k a key,
# which is exactly one of our retired figures, and that sentence is right.
POSSESSIVE = re.compile(
    r"(Fawley(?: Court)?'s(?:\s+(?:own|underwritten|modelled|ruled))?\s+)"
    r"(\(?£[\d,.]+[mkbn]?\)?|\(?[\d.]+%\)?|[\d.]+x)")


def sub_prose(s):
    if not isinstance(s, str) or "Fawley" not in s:
        return s
    def one(m):
        return m.group(1) + SWAP.get(m.group(2), m.group(2))
    out = POSSESSIVE.sub(one, s)
    # A key count is not figure-like, so the map cannot carry it. In a sentence
    # that names Fawley it is ours: no hotel in the comparable set has ever had
    # the counts this underwrite has run at, which is asserted below.
    if KEY_PHRASE:
        out = KEY_PHRASE.sub(lambda m: F["keys"] + m.group(2), out)
    # "Year 7 revenue a key or 33.88% GOP" -- a figure the sentence hands to the
    # subject by naming what it is, without a possessive in front of it.
    for old, new in SWAP.items():
        out = re.sub(r"(?<![\d.,])" + re.escape(old) + r"(?=\s+(?:GOP|hotel works|a key))",
                     new, out)
    return out
