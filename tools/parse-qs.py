"""Parse the vendor-questions cross-check markdown into structured JSON.

Source of record:
  Research/vendor-qs-crosscheck-20260816.md

Every question, its status tag, its full body and every section count is taken
verbatim. Nothing is summarised, re-worded or re-counted here: the counts are
read off the document's own "Section count" lines and its Register 2 tables, and
the verifier re-runs this parse and compares the result against what the page
ships.

Emits src/qs-data.json.
"""
import json, re, os, sys

SRC = ("D:/OneDrive - Strand Labs/2. Clients/Align/2. Live Deals/Fawley Court/"
       "Research/vendor-qs-crosscheck-20260816.md")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "qs-data.json")

raw = open(SRC, encoding="utf-8").read()
lines = raw.split("\n")

STATUSES = ["ANSWERED", "PARTIAL", "NOT IN ROOM", "JUDGMENT"]

Q_RE = re.compile(r"^\*\*(\d+[a-z]?)\.\s+(.*?)\*\*\s*$")
SEC_RE = re.compile(r"^## (.+?)\s*$")
HALF_RE = re.compile(r"^# (.+?)\s*$")
SUB_RE = re.compile(r"^### (.+?)\s*$")
COUNT_RE = re.compile(r"^\*\*Section count — (.+?) \((\d+) items?\): (.+?)\*\*\s*$")

halves = []          # [{title, sections:[...]}]
cur_half = None
cur_sec = None
cur_q = None
cur_sub = None
in_register = False
register_md = []
preamble = []        # lines before the first half


def flush_q():
    global cur_q
    if cur_q is not None:
        # trim trailing blank lines
        while cur_q["body"] and not cur_q["body"][-1].strip():
            cur_q["body"].pop()
        cur_sec["items"].append(cur_q)
        cur_q = None


i = 0
while i < len(lines):
    ln = lines[i]

    if ln.startswith("# Register 1"):
        flush_q()
        in_register = True
    if in_register:
        register_md.append(ln)
        i += 1
        continue

    m = HALF_RE.match(ln)
    if m and not ln.startswith("##"):
        flush_q()
        cur_half = {"title": m.group(1), "sections": []}
        halves.append(cur_half)
        cur_sec = None
        cur_sub = None
        i += 1
        continue

    m = SEC_RE.match(ln)
    if m and cur_half is not None:
        flush_q()
        name = m.group(1)
        # "Hotel Development *(Align Partners call)*"
        label = re.sub(r"\s*\*\((.+?)\)\*", r" (\1)", name)
        cur_sec = {"name": label, "items": [], "count": None, "intro": []}
        cur_half["sections"].append(cur_sec)
        cur_sub = None
        i += 1
        continue

    m = SUB_RE.match(ln)
    if m and cur_sec is not None:
        flush_q()
        cur_sub = m.group(1)
        i += 1
        continue

    m = COUNT_RE.match(ln)
    if m and cur_sec is not None:
        flush_q()
        counts = {}
        for part in m.group(3).split("·"):
            part = part.strip()
            for s in STATUSES:
                if part.startswith(s):
                    counts[s] = int(part[len(s):].strip())
        cur_sec["count"] = {"label": m.group(1), "items": int(m.group(2)), "counts": counts}
        i += 1
        continue

    m = Q_RE.match(ln)
    if m and cur_sec is not None:
        flush_q()
        cur_q = {"n": m.group(1), "q": m.group(2), "status": None,
                 "statusLine": None, "body": [], "sub": cur_sub}
        i += 1
        continue

    if cur_q is not None:
        # first bolded lead of the body carries the status tag
        if cur_q["status"] is None and ln.strip().startswith("**"):
            lead = ln.strip()
            for s in STATUSES:
                if lead.startswith("**" + s):
                    cur_q["status"] = s
                    break
            if cur_q["status"] is not None:
                # a combined tag: "**PARTIAL / JUDGMENT.**", "**JUDGMENT / NOT IN ROOM.**"
                tag = re.match(r"^\*\*([A-Z /]+?)[.\u2014*]", lead)
                cur_q["statusLine"] = lead
        cur_q["body"].append(ln)
        i += 1
        continue

    if cur_sec is not None:
        cur_sec["intro"].append(ln)
    elif cur_half is not None:
        cur_half.setdefault("intro", []).append(ln)
    else:
        preamble.append(ln)
    i += 1

flush_q()

# ── the Branding section carries one un-numbered item: the brand list ──
for h in halves:
    for s in h["sections"]:
        if s["name"] == "Branding" and not s["items"]:
            intro = "\n".join(s["intro"]).strip().split("\n")
            # the italic brand list is the question; the rest is the body
            qtext, body = [], []
            seen_status = False
            for ln in intro:
                if not seen_status and ln.strip().startswith("**PARTIAL"):
                    seen_status = True
                (body if seen_status else qtext).append(ln)
            s["items"].append({
                "n": "\u2014",
                "q": " ".join(x.strip().strip("*") for x in qtext if x.strip()),
                "status": "PARTIAL",
                "statusLine": body[0].strip() if body else None,
                "body": [x for x in body],
                "sub": None,
            })
            s["intro"] = []

# ── Register 1: the ask list ──
reg = "\n".join(register_md)
ask_groups = []
cur_g = None
for ln in reg.split("\n"):
    if ln.startswith("# Register 2"):
        break
    m = re.match(r"^## ([A-G])\. (.+?)\s*$", ln)
    if m:
        cur_g = {"key": m.group(1), "title": m.group(2), "items": []}
        ask_groups.append(cur_g)
        continue
    if cur_g is None:
        continue
    m = re.match(r"^(\d+)\. (.*)$", ln)
    if m:
        cur_g["items"].append({"n": int(m.group(1)), "text": [m.group(2)]})
        continue
    if cur_g["items"] and (ln.startswith("   ") or ln.startswith("    ")):
        cur_g["items"][-1]["text"].append(ln.strip())
for g in ask_groups:
    for it in g["items"]:
        it["text"] = " ".join(it["text"]).strip()

ask_intro = []
for ln in reg.split("\n"):
    if ln.startswith("## A."):
        break
    if ln.startswith("# Register 1"):
        continue
    ask_intro.append(ln)
ask_intro = "\n".join(ask_intro).strip()

# ── Register 2: the count tables, read verbatim off the document ──
reg2 = reg[reg.index("# Register 2"):]
tables = {}
cur_t = None
for ln in reg2.split("\n"):
    m = re.match(r"^## (.+?)\s*$", ln)
    if m:
        cur_t = m.group(1)
        tables[cur_t] = []
        continue
    if cur_t and ln.startswith("|") and not re.match(r"^\|[-: |]+\|$", ln):
        cells = [c.strip() for c in ln.strip().strip("|").split("|")]
        tables[cur_t].append(cells)

closing = reg2[reg2.index("Read plainly"):] if "Read plainly" in reg2 else ""
closing = closing.split("---")[0].strip()

footer = ""
if "*Preliminary and based on the data room" in reg2:
    footer = reg2[reg2.index("*Preliminary and based on the data room"):].strip().strip("*").strip()

data = {
    "source": "Research/vendor-qs-crosscheck-20260816.md",
    "preamble": "\n".join(preamble).strip(),
    "halves": halves,
    "askIntro": ask_intro,
    "askGroups": ask_groups,
    "tables": tables,
    "closing": closing,
    "footer": footer,
}

# join body lines into paragraph blocks
def blocks(md_lines):
    out, buf = [], []
    for ln in md_lines:
        if ln.strip() == "":
            if buf:
                out.append("\n".join(buf))
                buf = []
        else:
            buf.append(ln)
    if buf:
        out.append("\n".join(buf))
    return out

for h in data["halves"]:
    for s in h["sections"]:
        s["intro"] = blocks(s["intro"])
        for it in s["items"]:
            it["body"] = blocks(it["body"])

# The document's own title line parses as a "half" with no sections — it is the
# document heading, not a half. Its text becomes the preamble.
titled = [h for h in data["halves"] if not h["sections"]]
if titled:
    data["docTitle"] = titled[0]["title"]
    data["docIntro"] = "\n".join(titled[0].get("intro", [])).strip()
data["halves"] = [h for h in data["halves"] if h["sections"]]
for h in data["halves"]:
    h["intro"] = "\n".join(h.get("intro", [])).strip()

# An item with no status tag is a group header (New Development item 1 heads
# 1a–1e). The document's own section counts exclude it, and so do we.
total = 0
for h in data["halves"]:
    for s in h["sections"]:
        for it in s["items"]:
            it["header"] = it["status"] is None
            if not it["header"]:
                total += 1
data["totalItems"] = total

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)

print("questions parsed (status-tagged):", total)
ok = True
for h in data["halves"]:
    print(" half:", h["title"])
    for s in h["sections"]:
        got = len([i for i in s["items"] if not i["header"]])
        tally = {}
        for i in s["items"]:
            if i["status"]:
                tally[i["status"]] = tally.get(i["status"], 0) + 1
        c = s["count"]
        norm = {k: v for k, v in (c["counts"] if c else {}).items() if v}
        good = c and c["items"] == got and norm == tally
        ok = ok and bool(good)
        flag = "" if good else f"   <<< MISMATCH parsed {tally}"
        print(f"   {s['name']:<40} parsed {got:>3}  doc {c['items'] if c else '?':>3}  {c['counts'] if c else ''}{flag}")
print("counts tie to the document:", ok)
print("ask items:", sum(len(g['items']) for g in data['askGroups']))
print("tables:", {k: len(v) for k, v in data["tables"].items()})
