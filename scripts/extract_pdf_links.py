"""Extract per-page link annotations with their anchor text from the two
workout-plan PDFs, downloading them from Google Drive first (they exceed the
10 MB Drive-API download limit, but direct link-share download works from an
environment with open egress, e.g. GitHub Actions).

Output: canonical/<plan>-plan-links.json — for each PDF page: the page's
text and every hyperlink with its anchor text (the words under the link
rectangle) in annotation order. This is the canonical text<->link mapping
used to place video embeds in the wiki content.
"""
import json
import os

PDFS = {
    "basic": "1Ce0XirE69WGnEa0vVMOw83kJo6lPxeXa",
    "competitive": "1kEzME5oqin2AtlO27PNohUImSQ3zWoPp",
}


def ensure(pdf_path: str, file_id: str) -> None:
    if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 1_000_000:
        return
    import re
    import requests

    session = requests.Session()
    resp = session.get(
        "https://drive.google.com/uc",
        params={"export": "download", "id": file_id},
        stream=True,
        timeout=120,
    )
    if "text/html" in resp.headers.get("content-type", ""):
        # Virus-scan / confirm interstitial: submit the download form
        html = resp.text
        action_m = re.search(r'action="([^"]+)"', html)
        if not action_m:
            print(f"DOWNLOAD FAILED for {file_id}: status={resp.status_code}")
            print(html[:1000])
            raise SystemExit(1)
        fields = dict(re.findall(r'name="([^"]+)"\s+value="([^"]*)"', html))
        resp = session.get(action_m.group(1).replace("&amp;", "&"),
                           params=fields, stream=True, timeout=300)
    with open(pdf_path, "wb") as f:
        for chunk in resp.iter_content(1 << 20):
            f.write(chunk)
    with open(pdf_path, "rb") as f:
        magic = f.read(5)
    if magic != b"%PDF-":
        print(f"DOWNLOAD FAILED for {file_id}: not a PDF (magic={magic!r}, "
              f"size={os.path.getsize(pdf_path)})")
        with open(pdf_path, "rb") as f:
            print(f.read(800))
        raise SystemExit(1)
    print(f"downloaded {file_id}: {os.path.getsize(pdf_path)} bytes")


def extract(pdf_path: str):
    import pdfplumber
    from pypdf import PdfReader

    reader = PdfReader(pdf_path)
    plumber = pdfplumber.open(pdf_path)
    pages_out = []
    for pno, page in enumerate(reader.pages):
        ppage = plumber.pages[pno]
        words = ppage.extract_words()
        page_h = float(ppage.height)
        links = []
        for a in (page.get("/Annots") or []):
            obj = a.get_object()
            if obj.get("/Subtype") != "/Link":
                continue
            action = obj.get("/A")
            if not action or "/URI" not in action:
                continue
            uri = str(action["/URI"])
            rect = [float(x) for x in obj["/Rect"]]
            x0, y0 = min(rect[0], rect[2]), min(rect[1], rect[3])
            x1, y1 = max(rect[0], rect[2]), max(rect[1], rect[3])
            top, bottom = page_h - y1, page_h - y0
            anchor = [
                w["text"]
                for w in words
                if x0 - 2 <= (w["x0"] + w["x1"]) / 2 <= x1 + 2
                and top - 2 <= (w["top"] + w["bottom"]) / 2 <= bottom + 2
            ]
            links.append({
                "uri": uri,
                "anchor": " ".join(anchor),
                "rect": [round(v, 1) for v in (x0, top, x1, bottom)],
            })
        pages_out.append({
            "page": pno + 1,
            "text": ppage.extract_text() or "",
            "links": links,
        })
    return pages_out


def main() -> None:
    os.makedirs("canonical", exist_ok=True)
    for plan, file_id in PDFS.items():
        pdf_path = f"/tmp/{plan}-plan.pdf"
        ensure(pdf_path, file_id)
        pages = extract(pdf_path)
        out = f"canonical/{plan}-plan-links.json"
        with open(out, "w") as f:
            json.dump({"fileId": file_id, "pages": pages}, f, indent=1)
        n = sum(len(p["links"]) for p in pages)
        print(f"{plan}: {len(pages)} pages, {n} link annotations -> {out}")


if __name__ == "__main__":
    main()
