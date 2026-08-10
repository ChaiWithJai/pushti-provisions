#!/usr/bin/env python3
"""Turn the canonical PDFs into deterministic, link-aware JSON.

Every PDF annotation is resolved to the words beneath its rectangle and then
attached to the overlapping (or nearest) text block. The resulting JSON is the
only content interface consumed by the Nuxt application.
"""

from __future__ import annotations

import hashlib
import json
import math
import re
from collections import Counter
from pathlib import Path
from statistics import median
from urllib.parse import parse_qs, urlparse

import pdfplumber
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PDF_DIR = ROOT / "public" / "canonical"
OUT_DIR = ROOT / "content" / "boxing"

SOURCES = [
    {
        "slug": "guides-and-tips",
        "title": "Guides & Tips",
        "edition": "KO Boxing Package 3.0",
        "filename": "guides-and-tips.pdf",
        "driveUrl": "https://drive.google.com/file/d/18w_cvvbCtpIC0j1zGzXpebDWLHjlJwzy/view",
        "description": "Technique lessons, training guidance, safety notes, and the core video curriculum.",
    },
    {
        "slug": "basic-workout-plan",
        "title": "Basic Workout Plan",
        "edition": "KO Boxing Package 2.0",
        "filename": "basic-workout-plan.pdf",
        "driveUrl": "https://drive.google.com/file/d/1Ce0XirE69WGnEa0vVMOw83kJo6lPxeXa/view",
        "description": "Beginner boxing workouts, lifting sessions, recovery guidance, and linked demonstrations.",
    },
    {
        "slug": "competitive-workout-plan",
        "title": "Competitive Workout Plan",
        "edition": "KO Boxing Package 3.0",
        "filename": "competitive-workout-plan.pdf",
        "driveUrl": "https://drive.google.com/file/d/1kEzME5oqin2AtlO27PNohUImSQ3zWoPp/view",
        "description": "A five-week competitive program with boxing, conditioning, strength, and recovery work.",
    },
]


def clean_text(value: str) -> str:
    value = value.replace("\\", "").replace("\u00a0", " ")
    value = re.sub(r"\s+", " ", value).strip()
    # Canva often paints display words twice in the same position. dedupe_chars
    # catches exact overlays; this catches adjacent extraction duplicates.
    words = value.split()
    normalized_words = []
    for word in words:
        # Canva's outlined display type is sometimes encoded as two identical
        # glyph runs ("BBOOXXIINNGG"). Collapse only when every pair matches.
        if len(word) >= 6 and len(word) % 2 == 0 and all(word[i] == word[i + 1] for i in range(0, len(word), 2)):
            word = word[::2]
        normalized_words.append(word)
    words = normalized_words
    # Collapse a repeated phrase produced by two nearly overlapping text runs.
    if len(words) % 2 == 0:
        half = len(words) // 2
        if [w.casefold() for w in words[:half]] == [w.casefold() for w in words[half:]]:
            words = words[:half]
    if len(words) >= 2:
        compact = []
        for word in words:
            if not compact or word.casefold() != compact[-1].casefold():
                compact.append(word)
        value = " ".join(compact)
    return value


def rect_distance(a, b) -> float:
    ax = (a[0] + a[2]) / 2
    ay = (a[1] + a[3]) / 2
    bx = (b[0] + b[2]) / 2
    by = (b[1] + b[3]) / 2
    return math.hypot(ax - bx, ay - by)


def overlap_area(a, b) -> float:
    width = max(0.0, min(a[2], b[2]) - max(a[0], b[0]))
    height = max(0.0, min(a[3], b[3]) - max(a[1], b[1]))
    return width * height


def video_meta(url: str) -> dict | None:
    match = re.search(r"(?:youtu\.be/|youtube\.com/(?:watch\?(?:[^#]*&)?v=|shorts/|embed/))([\w-]{11})", url)
    if not match:
        return None
    video_id = match.group(1)
    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    raw_start = (query.get("start") or query.get("t") or ["0"])[0]
    start_match = re.search(r"\d+", raw_start)
    start = int(start_match.group()) if start_match else 0
    embed_url = f"https://www.youtube-nocookie.com/embed/{video_id}?rel=0"
    if start:
        embed_url += f"&start={start}"
    return {
        "id": video_id,
        "key": f"{video_id}:{start}",
        "start": start,
        "short": "/shorts/" in url,
        "embedUrl": embed_url,
        "thumbnailUrl": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
    }


def link_kind(url: str) -> str:
    if "youtu.be" in url or "youtube.com" in url:
        return "youtube"
    if "instagram.com" in url:
        return "instagram"
    return "external"


def extract_words(page) -> list[dict]:
    deduped = page.dedupe_chars(tolerance=1)
    words = deduped.extract_words(
        use_text_flow=False,
        keep_blank_chars=False,
        x_tolerance=2,
        y_tolerance=3,
        extra_attrs=["size", "fontname", "non_stroking_color"],
    )
    visible = []
    for word in words:
        if not clean_text(word.get("text", "")):
            continue
        color = word.get("non_stroking_color")
        is_black = color in (0, (0, 0, 0), [0, 0, 0], (0.0, 0.0, 0.0), [0.0, 0.0, 0.0])
        # Canva inserts a hidden, small, black text layer beneath many linked
        # phrases. It is useful to the PDF annotation, but it is not visible
        # trainer content and must never appear in a lesson.
        if is_black and float(word.get("size", 10)) < 9:
            continue
        visible.append(word)
    return visible


def make_blocks(words: list[dict], page_number: int, page_height: float) -> tuple[list[dict], dict]:
    if not words:
        return [], {"visibleWords": 0, "representedWords": 0, "coverage": 1, "removedOverlays": 0, "removedDecorations": 0}
    ordered = sorted(words, key=lambda w: (round(float(w["top"]), 1), float(w["x0"])))
    lines: list[list[dict]] = []
    for word in ordered:
        center = (float(word["top"]) + float(word["bottom"])) / 2
        if lines:
            last_center = median((float(w["top"]) + float(w["bottom"])) / 2 for w in lines[-1])
        if lines and abs(center - last_center) <= max(3.0, float(word.get("size", 10)) * 0.25):
            lines[-1].append(word)
        else:
            lines.append([word])

    raw = []
    for line in lines:
        line.sort(key=lambda w: float(w["x0"]))
        segments: list[list[dict]] = [[]]
        for word in line:
            if segments[-1]:
                previous_word = segments[-1][-1]
                gap = float(word["x0"]) - float(previous_word["x1"])
                local_size = median(float(item.get("size", 10)) for item in segments[-1])
                current_text = clean_text(" ".join(item["text"] for item in segments[-1]))
                margin_marker = (
                    float(previous_word["x1"]) < 30
                    and float(word["x0"]) > 23
                    and bool(re.fullmatch(r"#?\s*\d+", current_text))
                    and ("#" in current_text or float(segments[-1][0]["x0"]) < 20)
                )
                if margin_marker or gap > max(18, min(30, local_size * 1.8)):
                    segments.append([])
            segments[-1].append(word)

        merged_segments: list[list[dict]] = []
        for segment in segments:
            segment_text = clean_text(" ".join(word["text"] for word in segment))
            previous_text = clean_text(" ".join(word["text"] for word in merged_segments[-1])) if merged_segments else ""
            if merged_segments and re.search(r"\bDAY$", previous_text, re.I) and re.fullmatch(r"\d+", segment_text):
                merged_segments[-1].extend(segment)
            else:
                merged_segments.append(segment)

        for segment in merged_segments:
            text = clean_text(" ".join(w["text"] for w in segment))
            if not text:
                continue
            bbox = [
                min(float(w["x0"]) for w in segment),
                min(float(w["top"]) for w in segment),
                max(float(w["x1"]) for w in segment),
                max(float(w["bottom"]) for w in segment),
            ]
            size = median(float(w.get("size", 10)) for w in segment)
            tokens = text.split()
            decorative = (
                bbox[1] > page_height - 42
                or (bbox[0] > 320 and size > 38)
                or (len(text) == 1 and size > 36)
                or (2 <= len(tokens) <= 3 and all(len(token) == 1 for token in tokens) and len({token.casefold() for token in tokens}) == 1)
            )
            if decorative:
                raw.append({"removed": "decoration", "text": text, "wordCount": len(text.split())})
                continue
            alpha = re.sub(r"[^A-Za-z]", "", text)
            uppercase = bool(alpha) and alpha.isupper()
            if size >= 24:
                block_type = "title"
            elif re.fullmatch(r"(?:#\s*\d*|\d+)", text):
                block_type = "marker"
            elif (size >= 15.5 and len(text) <= 32) or (uppercase and size >= 12 and len(text) <= 120):
                block_type = "heading"
            else:
                block_type = "paragraph"
            raw.append({"type": block_type, "text": text, "bbox": bbox, "size": round(size, 1), "wordCount": len(text.split())})

    vertical_candidates = [
        item for item in raw
        if "type" in item and item["bbox"][0] > 250 and re.fullmatch(r"[A-Z0-9]", item["text"])
    ]
    for item in vertical_candidates:
        center = (item["bbox"][0] + item["bbox"][2]) / 2
        column = [candidate for candidate in vertical_candidates if abs((candidate["bbox"][0] + candidate["bbox"][2]) / 2 - center) < 15]
        if len(column) >= 3 and max(candidate["bbox"][1] for candidate in column) - min(candidate["bbox"][1] for candidate in column) > 20:
            item.pop("type", None)
            item["removed"] = "decoration"

    removed_overlays = 0
    visible_items = [item for item in raw if "type" in item]
    blocks = []
    for item in visible_items:
        duplicate = None
        for previous in reversed(blocks[-5:]):
            if previous["text"].casefold() != item["text"].casefold():
                continue
            x_overlap = max(0.0, min(previous["bbox"][2], item["bbox"][2]) - max(previous["bbox"][0], item["bbox"][0]))
            min_width = min(previous["bbox"][2] - previous["bbox"][0], item["bbox"][2] - item["bbox"][0])
            y_distance = abs((previous["bbox"][1] + previous["bbox"][3]) / 2 - (item["bbox"][1] + item["bbox"][3]) / 2)
            if min_width and x_overlap / min_width > 0.8 and y_distance <= max(8, item["size"] * .55):
                duplicate = previous
                break
        if duplicate:
            duplicate["bbox"] = [
                min(duplicate["bbox"][0], item["bbox"][0]), min(duplicate["bbox"][1], item["bbox"][1]),
                max(duplicate["bbox"][2], item["bbox"][2]), max(duplicate["bbox"][3], item["bbox"][3]),
            ]
            removed_overlays += item["wordCount"]
            continue
        blocks.append({**item, "links": []})

    for index, block in enumerate(blocks, 1):
        block["id"] = f"p{page_number}-b{index}"
        block.pop("wordCount", None)
    input_word_count = sum(item.get("wordCount", 0) for item in raw)
    represented = sum(len(block["text"].split()) for block in blocks)
    removed_decorations = sum(item.get("wordCount", 0) for item in raw if item.get("removed") == "decoration")
    visible_words = input_word_count - removed_overlays - removed_decorations
    return blocks, {
        "visibleWords": visible_words,
        "representedWords": represented,
        "coverage": round(represented / visible_words, 6) if visible_words else 1,
        "removedOverlays": removed_overlays,
        "removedDecorations": removed_decorations,
    }


def union_bbox(items: list[dict]) -> list[float]:
    return [
        min(item["bbox"][0] for item in items), min(item["bbox"][1] for item in items),
        max(item["bbox"][2] for item in items), max(item["bbox"][3] for item in items),
    ]


def make_sections(page, blocks: list[dict], page_number: int) -> list[dict]:
    if not blocks:
        return []
    candidates = []
    for rect in page.rects:
        bbox = [float(rect["x0"]), float(rect["top"]), float(rect["x1"]), float(rect["bottom"])]
        width = bbox[2] - bbox[0]
        height = bbox[3] - bbox[1]
        if width < 105 or height < 24 or width > float(page.width) * .95 or height > float(page.height) * .9:
            continue
        if bbox[1] < 35 or bbox[3] > float(page.height) - 30:
            continue
        contained = [block for block in blocks if bbox[0] - 5 <= (block["bbox"][0] + block["bbox"][2]) / 2 <= bbox[2] + 5 and bbox[1] - 5 <= (block["bbox"][1] + block["bbox"][3]) / 2 <= bbox[3] + 5]
        if len(contained) < 2:
            continue
        candidates.append({"bbox": bbox, "blocks": contained, "area": width * height})

    assignments: dict[str, int] = {}
    for block in blocks:
        matches = [candidate for candidate in candidates if block in candidate["blocks"]]
        if matches:
            chosen = min(matches, key=lambda item: item["area"])
            assignments[block["id"]] = candidates.index(chosen)

    groups: list[list[dict]] = []
    for candidate_index in sorted(set(assignments.values())):
        members = [block for block in blocks if assignments.get(block["id"]) == candidate_index]
        if members:
            groups.append(members)

    unassigned = [block for block in blocks if block["id"] not in assignments]
    # Number markers sit just outside the colored drill panel. Attach them to
    # the panel sharing the same vertical band.
    still_unassigned = []
    for block in unassigned:
        if block["type"] == "marker":
            match = min(groups, key=lambda group: rect_distance(block["bbox"], union_bbox(group)), default=None)
            if match and rect_distance(block["bbox"], union_bbox(match)) < 55:
                match.append(block)
                continue
        still_unassigned.append(block)

    # Group remaining copy by reading zone and proximity. This covers simple
    # warm-up banners, rest pages, and prose-led recovery pages.
    for zone in (0, 1):
        zone_blocks = [block for block in still_unassigned if (0 if block["bbox"][0] < 320 else 1) == zone]
        zone_blocks.sort(key=lambda item: (item["bbox"][1], item["bbox"][0]))
        current: list[dict] = []
        for block in zone_blocks:
            split_after_page_title = (
                current
                and current[0]["type"] == "title"
                and re.search(r"^(?:BOXING WORKOUT|WEEK\s*#|DAY\s+\d+$)", current[0]["text"], re.I)
                and block["bbox"][1] > 100
            )
            if current and (split_after_page_title or block["bbox"][1] - max(item["bbox"][3] for item in current) > 34):
                groups.append(current)
                current = []
            current.append(block)
        if current:
            groups.append(current)

    sections = []
    for group in groups:
        group.sort(key=lambda item: (item["bbox"][1], item["bbox"][0]))
        bbox = union_bbox(group)
        title_block = next((item for item in group if item["type"] in ("title", "heading")), group[0])
        title = title_block["text"]
        folded = title.casefold()
        if bbox[1] < 105 and any(item["type"] == "title" for item in group):
            kind = "header"
        elif "daily to do" in folded or "daily stretch" in folded:
            kind = "checklist"
        elif bbox[0] >= 320:
            kind = "supplement"
        elif "rest" in folded or "recovery" in folded or "warm up" in folded:
            kind = "recovery"
        else:
            kind = "drill"
        sections.append({
            "id": "",
            "kind": kind,
            "title": title,
            "bbox": [round(value, 1) for value in bbox],
            "blocks": group,
            "links": [],
        })

    sections.sort(key=lambda item: (0 if item["kind"] == "header" else 1 if item["bbox"][0] < 320 else 2, item["bbox"][1]))
    for index, section in enumerate(sections, 1):
        section["id"] = f"p{page_number}-s{index}"
    return sections


def resolve_links(pdf_page, plumber_page, words: list[dict], blocks: list[dict], sections: list[dict]) -> tuple[list[dict], int]:
    height = float(plumber_page.height)
    raw_links = []
    section_for_block = {block["id"]: section for section in sections for block in section["blocks"]}
    for annotation_ref in pdf_page.get("/Annots") or []:
        annotation = annotation_ref.get_object()
        if annotation.get("/Subtype") != "/Link":
            continue
        action = annotation.get("/A")
        if not action or "/URI" not in action:
            continue
        url = str(action["/URI"])
        raw_rect = [float(value) for value in annotation["/Rect"]]
        x0, x1 = sorted((raw_rect[0], raw_rect[2]))
        y0, y1 = sorted((raw_rect[1], raw_rect[3]))
        rect = [x0, height - y1, x1, height - y0]
        # Canva sometimes emits zero-content edge fragments for a wrapped
        # hyperlink. Keeping them creates a phantom copy of the video in the
        # neighboring panel, so only retain clickable rectangles with area.
        if rect[2] - rect[0] < 6 or rect[3] - rect[1] < 6:
            continue
        anchor_words = [
            word for word in words
            if rect[0] - 3 <= (float(word["x0"]) + float(word["x1"])) / 2 <= rect[2] + 3
            and rect[1] - 3 <= (float(word["top"]) + float(word["bottom"])) / 2 <= rect[3] + 3
        ]
        anchor_words.sort(key=lambda w: (float(w["top"]), float(w["x0"])))
        anchor = clean_text(" ".join(word["text"] for word in anchor_words))

        target = None
        if blocks:
            target = max(blocks, key=lambda block: overlap_area(rect, block["bbox"]))
            if overlap_area(rect, target["bbox"]) == 0:
                target = min(blocks, key=lambda block: rect_distance(rect, block["bbox"]))
        label = anchor or (target["text"][:120] if target else "Linked resource")
        item = {
            "text": label,
            "url": url,
            "kind": link_kind(url),
            "rect": [round(value, 1) for value in rect],
        }
        video = video_meta(url)
        if video:
            item["video"] = video
        if target:
            item["blockId"] = target["id"]
            item["sectionId"] = section_for_block[target["id"]]["id"]
        raw_links.append(item)

    base_groups: dict[tuple[str, str], list[dict]] = {}
    for item in raw_links:
        resource_key = item.get("video", {}).get("key", item["url"])
        base_groups.setdefault((item.get("sectionId", "page"), resource_key), []).append(item)

    # Preserve an intentional repeat of the same URL under two different
    # exercises. Only collapse annotations whose rectangles form one wrapped
    # or shadowed text anchor.
    grouped: list[list[dict]] = []
    for items in base_groups.values():
        items.sort(key=lambda item: (item["rect"][1], item["rect"][0]))
        clusters: list[list[dict]] = []
        for item in items:
            if not clusters:
                clusters.append([item])
                continue
            previous_bottom = max(link["rect"][3] for link in clusters[-1])
            if item["rect"][1] - previous_bottom <= 12:
                clusters[-1].append(item)
            else:
                clusters.append([item])
        grouped.extend(clusters)

    resolved = []
    for items in grouped:
        first = items[0]
        candidate_blocks = [next((block for block in blocks if block["id"] == item.get("blockId")), None) for item in items]
        candidate_blocks = [block for block in candidate_blocks if block]
        target = None
        if candidate_blocks:
            scores = Counter(block["id"] for block in candidate_blocks)
            target = max(candidate_blocks, key=lambda block: (scores[block["id"]], block["type"] in ("title", "heading"), -block["bbox"][1]))
        rect = [
            min(item["rect"][0] for item in items), min(item["rect"][1] for item in items),
            max(item["rect"][2] for item in items), max(item["rect"][3] for item in items),
        ]
        link = {**first, "rect": [round(value, 1) for value in rect], "annotationCount": len(items)}
        if target:
            link["blockId"] = target["id"]
            link["text"] = target["text"][:160]
            target["links"].append(link)
            section = section_for_block[target["id"]]
            section["links"].append(link)
        resolved.append(link)
    resolved.sort(key=lambda item: (item["rect"][1], item["rect"][0]))
    return resolved, len(raw_links)


def page_title(blocks: list[dict], number: int) -> str:
    candidates = [b["text"] for b in blocks if b["type"] in ("title", "heading") and 3 <= len(b["text"]) <= 100]
    priorities = [
        r"BOXING\s+WORKOUT\s*#?\s*\d+", r"(?:LIFT|ENDURANCE|ACTIVE\s+RECOVERY)\s+(?:WORKOUT\s*)?#?\s*\d+",
        r"DAY\s+\d+", r"WEEK\s*#?\s*\d+", r"LESSON\s*#?\s*\d+", r"PART\s*[IVX0-9]+",
        r"SHADOW BOXING", r"BAG WORK", r"SPARRING", r"RECOVERY", r"NUTRITION", r"DISCLAIMER",
    ]
    for pattern in priorities:
        for candidate in candidates:
            if re.search(pattern, candidate, re.I):
                return candidate.title()
    if candidates:
        return candidates[0].title()
    return f"Page {number}"


def extract_source(source: dict) -> dict:
    path = PDF_DIR / source["filename"]
    reader = PdfReader(path)
    pages = []
    link_counts = Counter()
    with pdfplumber.open(path) as plumber:
        for page_index, pdf_page in enumerate(reader.pages):
            page_number = page_index + 1
            plumber_page = plumber.pages[page_index]
            words = extract_words(plumber_page)
            blocks, audit = make_blocks(words, page_number, float(plumber_page.height))
            sections = make_sections(plumber_page, blocks, page_number)
            links, raw_annotation_count = resolve_links(pdf_page, plumber_page, words, blocks, sections)
            link_counts.update(link["kind"] for link in links)
            pages.append({
                "number": page_number,
                "title": page_title(blocks, page_number),
                "width": round(float(plumber_page.width), 1),
                "height": round(float(plumber_page.height), 1),
                "text": clean_text("\n".join(block["text"] for block in blocks)),
                "blocks": blocks,
                "sections": sections,
                "links": links,
                "audit": {**audit, "rawAnnotations": raw_annotation_count, "resolvedResources": len(links)},
            })

    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    return {
        "schemaVersion": 2,
        "source": {
            **source,
            "pdfUrl": f"/canonical/{source['filename']}",
            "sha256": digest,
            "pageCount": len(pages),
        },
        "stats": {
            "pages": len(pages),
            "blocks": sum(len(page["blocks"]) for page in pages),
            "links": sum(link_counts.values()),
            "youtubeVideos": link_counts["youtube"],
        },
        "pages": pages,
    }


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    catalog = []
    for source in SOURCES:
        document = extract_source(source)
        out_path = OUT_DIR / f"{source['slug']}.json"
        out_path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + "\n")
        catalog.append({"source": document["source"], "stats": document["stats"]})
        print(f"{out_path.relative_to(ROOT)}: {document['stats']}")
    (OUT_DIR / "catalog.json").write_text(json.dumps({"documents": catalog}, indent=2) + "\n")


if __name__ == "__main__":
    main()
