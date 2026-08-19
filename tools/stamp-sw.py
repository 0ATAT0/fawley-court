"""Stamp the service worker's cache name with a hash of what it caches.

    python tools/stamp-sw.py [--check]

Why this exists. Every same-origin GET other than the page itself is served
cache-first with a background refresh, so a changed asset reaches a returning
visitor only on their *second* visit — and never at all if the cache name does
not change, because `activate` only deletes caches whose name differs from the
current one. `sw.js` sat on 'fawley-court-v5' through the estate-areas chapter,
the v29 re-strike and a whole restructure, which meant work that had shipped was
invisible to anyone who had opened the portal before. It was noticed only when
the principal was shown a section that had already been deleted.

Bumping the number by hand is the thing that failed. The name is now derived
from the bytes, so it moves when, and only when, something cached moves.

--check exits non-zero if the stamp is stale, which is what the gate calls.
"""
import hashlib, io, os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SW = os.path.join(HERE, "sw.js")

# the code that renders the portal, plus the shell the worker installs
EXTRA = ["index.html", "areas.js"]


def cached_files(sw):
    """the ASSETS list, as repo-relative paths"""
    block = re.search(r"const ASSETS = \[(.*?)\];", sw, re.S)
    if not block:
        sys.exit("sw.js: no ASSETS list")
    out = []
    for m in re.finditer(r"'\./([^']*)'", block.group(1)):
        if m.group(1):
            out.append(m.group(1))
    return out


def stamp(sw):
    h = hashlib.sha256()
    for rel in sorted(set(cached_files(sw) + EXTRA)):
        p = os.path.join(HERE, rel)
        if not os.path.exists(p):
            sys.exit("sw.js caches %s, which is not on disk" % rel)
        h.update(rel.encode("utf-8"))
        h.update(io.open(p, "rb").read())
    return h.hexdigest()[:12]


def main():
    check = "--check" in sys.argv
    sw = io.open(SW, encoding="utf-8").read()
    want = stamp(sw)
    m = re.search(r"const CACHE = '([^']+)';", sw)
    if not m:
        sys.exit("sw.js: no CACHE name")
    have = m.group(1)
    name = "fawley-court-" + want
    if have == name:
        print("sw.js cache name is current: %s" % name)
        return
    if check:
        print("STALE: sw.js says %s, the files hash to %s" % (have, name))
        sys.exit(1)
    io.open(SW, "w", encoding="utf-8").write(
        sw[:m.start(1)] + name + sw[m.end(1):])
    print("sw.js cache name %s -> %s" % (have, name))


if __name__ == "__main__":
    main()
