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
    return {
        "id": video_id,
        "short": "/shorts/" in url,
        "embedUrl": f"https://www.youtube-nocookie.com/embed/{video_id}?rel=0",
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
        extra_attrs=["size"],
    )
    return [w for w in words if clean_text(w.get("text", ""))]


def make_blocks(words: list[dict], page_number: int) -> list[dict]:
    if not words:
        return []
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
        text = clean_text(" ".join(w["text"] for w in line))
        if not text:
            continue
        bbox = [
            min(float(w["x0"]) for w in line),
            min(float(w["top"]) for w in line),
            max(float(w["x1"]) for w in line),
            max(float(w["bottom"]) for w in line),
        ]
        size = median(float(w.get("size", 10)) for w in line)
        # Ignore oversized Canva decoration glyphs and doubled single-character
        # shadows. Numbered drill markers such as "# 1" remain intact.
        tokens = text.split()
        if (len(text) == 1 and size > 36) or (
            2 <= len(tokens) <= 3 and all(len(token) == 1 for token in tokens)
            and len({token.casefold() for token in tokens}) == 1
        ):
            continue
        alpha = re.sub(r"[^A-Za-z]", "", text)
        uppercase = bool(alpha) and alpha.isupper()
        block_type = "heading" if size >= 17 or (uppercase and len(text) <= 90) else "paragraph"
        item = {"type": block_type, "text": text, "bbox": bbox, "size": round(size, 1)}
        if raw and raw[-1]["text"].casefold() == text.casefold():
            previous = raw[-1]
            x_overlap = max(0.0, min(previous["bbox"][2], bbox[2]) - max(previous["bbox"][0], bbox[0]))
            min_width = min(previous["bbox"][2] - previous["bbox"][0], bbox[2] - bbox[0])
            y_distance = abs((previous["bbox"][1] + previous["bbox"][3]) / 2 - (bbox[1] + bbox[3]) / 2)
            if min_width and x_overlap / min_width > 0.8 and y_distance < max(size, previous["size"]):
                previous["bbox"] = [
                    min(previous["bbox"][0], bbox[0]), min(previous["bbox"][1], bbox[1]),
                    max(previous["bbox"][2], bbox[2]), max(previous["bbox"][3], bbox[3]),
                ]
                continue
        raw.append(item)

    # Merge nearby paragraph lines while keeping headings individually addressable.
    blocks = []
    for item in raw:
        if (
            blocks
            and item["type"] == blocks[-1]["type"] == "paragraph"
            and item["bbox"][1] - blocks[-1]["bbox"][3] < 10
        ):
            blocks[-1]["text"] = clean_text(blocks[-1]["text"] + " " + item["text"])
            blocks[-1]["bbox"][0] = min(blocks[-1]["bbox"][0], item["bbox"][0])
            blocks[-1]["bbox"][2] = max(blocks[-1]["bbox"][2], item["bbox"][2])
            blocks[-1]["bbox"][3] = item["bbox"][3]
        else:
            blocks.append({**item, "links": []})

    for index, block in enumerate(blocks, 1):
        block["id"] = f"p{page_number}-b{index}"
    return blocks


def resolve_links(pdf_page, plumber_page, words: list[dict], blocks: list[dict]) -> list[dict]:
    height = float(plumber_page.height)
    resolved = []
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
            target["links"].append(item)
        resolved.append(item)
    return resolved


def page_title(blocks: list[dict], number: int) -> str:
    candidates = [b["text"] for b in blocks if b["type"] == "heading" and 3 <= len(b["text"]) <= 100]
    priorities = [
        r"WORKOUT\s*#?\s*\d+", r"WEEK\s*\d+", r"LESSON\s*#?\s*\d+", r"PART\s*[IVX0-9]+",
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
            blocks = make_blocks(words, page_number)
            links = resolve_links(pdf_page, plumber_page, words, blocks)
            link_counts.update(link["kind"] for link in links)
            pages.append({
                "number": page_number,
                "title": page_title(blocks, page_number),
                "width": round(float(plumber_page.width), 1),
                "height": round(float(plumber_page.height), 1),
                "text": clean_text("\n".join(block["text"] for block in blocks)),
                "blocks": blocks,
                "links": links,
            })

    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    return {
        "schemaVersion": 1,
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
