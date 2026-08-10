# Canonical source extractions

The wiki under `content/` is authored from the original KO Boxing Package PDFs in the
[package Google Drive folder](https://drive.google.com/drive/folders/11nt5bAE5gjl1De1PJ2WO6r4247GaU0qV).
This directory preserves the raw material the wiki was generated from, for provenance and future regeneration.

## Files

- `basic-plan-extracted.txt` — full text extraction of **Basic Workout Plan.pdf** (Google Drive API text rendering). The body text comes first; the trailing block of `<https://…>` lines is the ordered list of every hyperlink annotation in the PDF (order verified to match PDF annotation order).
- `competitive-plan-extracted.txt` — same for **Competitive Workout Plan.pdf**.
- `guides-link-annotations.json` — precise link-annotation extraction from **Guides and Tips.pdf** (`public/canonical/KO-Boxing-Package-Guides-and-Tips.pdf`): every hyperlink with its page, target URI, and the anchor text under the link rectangle. This is the source of the lesson→video mapping in `data/videos/lessons.json`.

## Notes on fidelity

- The PDFs were designed in Canva; text extraction doubles styled display text word-by-word ("BOXING BOXING WORKOUT WORKOUT #1 #1") and occasionally interleaves text boxes. The wiki pages normalize this.
- The two workout-plan PDFs exceed the 10 MB Drive API download limit, so their binary PDFs are not vendored here — only their extractions. The link lists at the end of each extraction preserve **appearance order** but not per-drill anchor mapping; therefore the wiki presents each plan's videos as an ordered gallery (`data/videos/basic-plan.json`, `data/videos/competitive-plan.json`) rather than guessing per-drill labels.
- The 20 lesson videos in `data/videos/lessons.json` ARE precisely mapped (page-4/5 annotations of the Guides PDF).
