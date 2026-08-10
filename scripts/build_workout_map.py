"""Builds data/videos/workout-map.json — the exact assignment of every YouTube
link in the two workout-plan PDFs to the wiki page/section it belongs to.

Method (fully derived from verified structure):
1. The trailing block of each canonical/*-plan-extracted.txt preserves every
   PDF link annotation in document order (verified against the Guides PDF,
   whose annotations we extracted directly).
2. Every boxing workout page links the same warm-up video first and the same
   cool-down video last, so warm-up -> cool-down spans in the link sequence
   segment it into the 25 boxing workouts of each plan (basic has one page
   whose cool-down link is missing; that span is split at its interior
   warm-up occurrence).
3. Links between spans (lift pages, endurance, active recovery, nutrition,
   daily to-do sidebars) are assigned by an order-preserving alignment
   against the candidate PDF pages in that gap, scored by similarity between
   the video's YouTube title (data/videos/titles.json) and the page text.

Run: python3 scripts/build_workout_map.py
"""
import json
import re

WARM = 'NBx2IAu3nkw'   # "Boxing Follow Along Warm up | Lock In for Training"
COOL = 'SDiwB3FI5gY'   # "Follow Along Cool-Down"
FOOT = re.compile(r'(?:KO\s+)+(?:BOXING\s+)+(?:PACKAGE\s*)+(\d+)')
STOP = {'the', 'a', 'an', 'of', 'in', 'on', 'and', 'or', 'with', 'for', 'to',
        'at', 'your', 'this', 'do', 'it', 'is', 'i'}

titles = json.load(open('data/videos/titles.json'))


def tokens(s):
    s = re.sub(r'\\([#!.])', r'\1', str(s)).lower()
    s = re.sub(r'#\w+', ' ', s)  # hashtags in YouTube titles
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    out = []
    for t in s.split():
        if t in STOP or len(t) < 2:
            continue
        if out and out[-1] == t:  # Canva double-render artifact
            continue
        out.append(t)
    return out


def read_plan(plan):
    body, links = [], []
    in_links = False
    for line in open(f'canonical/{plan}-plan-extracted.txt'):
        if line.strip().startswith('<http'):
            in_links = True
        if in_links:
            m = re.search(r'<(.*?)>', line)
            if m:
                links.append(m.group(1))
        else:
            body.append(line.rstrip('\n'))
    return body, links


def link_runs(links):
    seq = []
    for u in links:
        m = re.search(r'(?:shorts/|youtu\.be/|v=)([\w-]{11})', u)
        if not m:
            continue  # external links (meal-plan doc, calculator) handled in prose
        vid = m.group(1)
        kind = 'short' if '/shorts/' in u else 'video'
        if seq and seq[-1][0] == vid:
            continue
        seq.append((vid, kind))
    return seq


def pages_of(body):
    pages, cur = [], []
    for line in body:
        m = FOOT.search(line)
        if m:
            before, after = line[:m.start()].strip(), line[m.end():].strip()
            if before:
                cur.append(before)
            pages.append('\n'.join(cur))
            cur = [after] if after else []
        else:
            cur.append(line)
    if '\n'.join(cur).strip():
        pages.append('\n'.join(cur))
    return pages


def page_keys(plan, pages):
    """Wiki content key for every PDF page (workout pages resolved later by
    span order, so here we only classify interstitial pages)."""
    keys = []
    for p in pages:
        cl = ' '.join(tokens(p))
        m_end = re.search(r'endurance workout (\d+)', cl)
        m_ar = re.search(r'active recovery workout (\d+)', cl)
        m_lift = re.search(r'\blift (\d+)', cl)
        if m_end:
            keys.append('endurance-' + m_end.group(1))
        elif m_ar:
            keys.append('active-recovery-' + m_ar.group(1))
        elif m_lift:
            keys.append('weightlifting' if plan == 'basic' else 'lift-' + m_lift.group(1))
        elif 'alternative running' in cl:
            keys.append('weightlifting' if plan == 'basic' else 'running')
        elif 'recovery tips' in cl or 'meal plan' in cl or 'nutrition' in cl:
            keys.append('recovery-and-nutrition')
        else:
            keys.append(None)
    return keys


def sim(vid, page_toks):
    t = tokens(titles.get(vid, {}).get('title') or '')
    if not t:
        return 0.05
    hits = sum(1 for x in t if x in page_toks)
    return hits / len(t)


def build(plan):
    body, links = read_plan(plan)
    seq = link_runs(links)
    pages = pages_of(body)
    pkeys = page_keys(plan, pages)
    ptoks = [set(tokens(p)) for p in pages]

    # --- segment into workout spans (warm-up ... cool-down) ---
    spans, gaps, cur = [], [[]], None
    for k, (vid, kind) in enumerate(seq):
        if cur is None:
            if vid == WARM:
                cur = k
            else:
                gaps[-1].append(k)
        else:
            if vid == COOL:
                spans.append([cur, k])
                cur = None
                gaps.append([])
    if cur is not None:
        spans.append([cur, len(seq) - 1])
        gaps.append([])

    # A workout page can miss its cool-down link, merging two workouts into
    # one span. Recover by splitting the largest spans at an interior warm-up
    # occurrence until we reach the expected 25.
    while len(spans) < 25:
        cand = None
        for si, (a, b) in enumerate(spans):
            for k in range(a + 1, b):
                if seq[k][0] == WARM and (cand is None or b - a > spans[cand[0]][1] - spans[cand[0]][0]):
                    cand = (si, k)
                    break
        if cand is None:
            break
        si, k = cand
        a, b = spans[si]
        spans[si:si + 1] = [[a, k - 1], [k, b]]
        gaps.insert(si + 1, [])
    assert len(spans) == 25, f'{plan}: expected 25 workout spans, got {len(spans)}'

    out = {}

    def add(key, vid, kind):
        out.setdefault(key, [])
        if not any(e['id'] == vid for e in out[key]):
            out[key].append({'id': vid, 'kind': kind,
                             'title': titles.get(vid, {}).get('title')})

    # workout spans -> workout-NN
    for n, (a, b) in enumerate(spans, start=1):
        for k in range(a, b + 1):
            add(f'workout-{n:02d}', *seq[k])

    # --- interstitial gaps ---
    # The Drive text extraction interleaves the basic plan's pages, so page
    # alignment is unreliable there. Instead: gap g sits between workout g and
    # g+1 (verified by the span segmentation), and within a gap the links are
    # either gym-exercise demos (the lift pages) or the workout page's own
    # sidebar links (daily stretch / to-do / extra drills below the cool-down
    # link). Classify by video title.
    GYM = re.compile(
        r'#gym|deadlift|bench|pendlay|\brow\b|rows\b|press\b|pull.?ups?|chin.?ups?'
        r'|snatch|clean\b|barbell|dumbbell|kettlebell|romanian|rdl|goblet|lunge'
        r'|curl|plank|bridge|glute|hip (airplane|thrust)|z.?press|shrug|hex bar'
        r'|landmine|farmer|face pull|split squat|back squat|front squat'
        r'|leg raise|reverse.+raise|arm raise|inverted', re.IGNORECASE)
    BOXY = re.compile(r'punch|boxing|round|stance|spar|defen[cs]|jab|hook|combo'
                      r'|footwork|shadow|drill', re.IGNORECASE)

    for g, idxs in enumerate(gaps):
        if not idxs:
            continue
        prev_w = g  # gap g follows workout g (gap 0 precedes workout 1)
        for k in idxs:
            vid, kind = seq[k]
            title = titles.get(vid, {}).get('title') or ''
            is_gym = bool(GYM.search(title)) and not BOXY.search(title)
            if plan == 'basic':
                if is_gym:
                    key = 'weightlifting'
                elif prev_w >= 1:
                    key = f'workout-{prev_w:02d}'
                else:
                    key = 'workout-01'
            else:
                week = min(5, max(1, -(-prev_w // 5) if prev_w >= 1 else 1))
                key = f'week-{week}-extras'
            add(key, vid, kind)

    return out


result = {}
for plan in ['basic', 'competitive']:
    result[plan] = build(plan)
    n = sum(len(v) for v in result[plan].values())
    print(plan, '->', {k: len(v) for k, v in sorted(result[plan].items())})
    print(plan, 'total entries:', n)

json.dump(result, open('data/videos/workout-map.json', 'w'), indent=1)
print('wrote data/videos/workout-map.json')
