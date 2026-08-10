# Canonical source extractions

The wiki under `content/` is authored from the original KO Boxing Package PDFs in the
[package Google Drive folder](https://drive.google.com/drive/folders/11nt5bAE5gjl1De1PJ2WO6r4247GaU0qV).
The PDFs are **not publicly link-shared** (Drive answers anonymous downloads with a
sign-in redirect), so everything here was read through the authenticated Google Drive
connector of the authoring session. This directory preserves the raw material for
provenance and regeneration.

## Files

- `basic-plan-extracted.txt` / `competitive-plan-extracted.txt` — full text
  extraction of the two workout-plan PDFs (Drive API text rendering). Body text
  first; the trailing block of `<https://…>` lines is every hyperlink annotation
  of the PDF **in document order** (verified against the Guides PDF, whose
  binary we could download and whose pypdf annotation order matches exactly).
- `guides-link-annotations.json` — direct pypdf/pdfplumber extraction from
  **Guides and Tips.pdf** (vendored at `public/canonical/`): every hyperlink
  with page, target URI, and anchor text. Source of the lesson→video mapping
  in `data/videos/lessons.json`.

## UI-facing JSON (in `data/videos/`)

- `titles.json` — `{videoId: {title, author}}` for all 510 referenced videos,
  fetched via YouTube oEmbed by the `fetch-titles` GitHub Actions workflow
  (the authoring sandbox has no route to youtube.com).
- `lessons.json` — the 20-lesson curriculum, exactly mapped from the Guides
  PDF annotations.
- `basic-plan.json` / `competitive-plan.json` — ordered unique video lists per
  plan (order of first appearance).
- `workout-map.json` — `{plan: {pageKey: [{id, kind, title}]}}`: every video
  link assigned to the wiki page/section it belongs to. Built by
  `scripts/build_workout_map.py` from the ordered annotation lists:
  1. Every boxing-workout page links the same warm-up video first
     (`NBx2IAu3nkw`) and the same cool-down video last (`SDiwB3FI5gY`), so
     warm-up→cool-down spans segment each plan's link sequence into its 25
     boxing workouts (one basic page misses its cool-down link; that span is
     split at its interior warm-up occurrence). Span counts match the plans'
     workout counts exactly.
  2. Links between spans belong to the interleaved lift / endurance / active
     recovery / sidebar content: in the basic plan they are classified by
     video title (gym-exercise demos → the weightlifting page, everything
     else → the adjacent workout's sidebar); in the competitive plan they are
     attributed to the enclosing week's "Lift, endurance & active recovery"
     block (week boundaries follow directly from the workout numbering).

`workout-map.json` and `titles.json` are consumed by the `WorkoutVideos`
content component; the gallery pages consume the per-plan ordered lists.
