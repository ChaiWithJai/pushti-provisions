# KO Boxing Package — Training Wiki

A wiki and training guide for the **KO Boxing Package** by Andrii Khotin, built with [Nuxt 3](https://nuxt.com), [Nuxt Content](https://content.nuxt.com) and the [IBM Carbon Design System](https://carbondesignsystem.com) (`@carbon/styles`).

## Canonical sources

The wiki content is derived from the original package PDFs, which remain the **canonical source of truth**. They live in the package's [Google Drive folder](https://drive.google.com/drive/folders/11nt5bAE5gjl1De1PJ2WO6r4247GaU0qV):

| Document | Drive link | In this repo |
| --- | --- | --- |
| Guides and Tips (KO Boxing Package 3.0) | [view](https://drive.google.com/file/d/18w_cvvbCtpIC0j1zGzXpebDWLHjlJwzy/view) | `public/canonical/KO-Boxing-Package-Guides-and-Tips.pdf` + extracted link map in `canonical/` |
| Basic Workout Plan | [view](https://drive.google.com/file/d/1Ce0XirE69WGnEa0vVMOw83kJo6lPxeXa/view) | text extraction in `canonical/` (PDF exceeds the 10 MB API download limit) |
| Competitive Workout Plan | [view](https://drive.google.com/file/d/1kEzME5oqin2AtlO27PNohUImSQ3zWoPp/view) | text extraction in `canonical/` (PDF exceeds the 10 MB API download limit) |
| START HERE.mp4 (welcome video) | [view](https://drive.google.com/file/d/1XKYD-arOpFfIJEo1gR0Ds5KTUJ2WX5Jd/view) | embedded from Drive in the wiki |

See [`canonical/README.md`](canonical/README.md) for details on how the extractions and video link maps were produced.

## Stack

- **Nuxt 3** with **@nuxt/content v2** — file-based wiki: every page is a Markdown file under `content/`
- **@carbon/styles** — IBM Carbon v11 styles, tokens and themes (g100 header zone, white content zone), with self-hosted IBM Plex fonts
- **Custom MDC components** (`components/content/`):
  - `::video-embed{id="..."}` — lazy YouTube facade (thumbnail + play button → `youtube-nocookie.com` iframe); vertical layout for Shorts via the `short` prop; video titles are fetched client-side via noembed.com
  - `::video-gallery{plan="basic|competitive"}` — grid of every video linked from a workout plan, in order of first appearance (`data/videos/*.json`)
  - `::lesson-grid{:part='1'}` — the 20-lesson curriculum with embeds (`data/videos/lessons.json`)
  - `::drive-video{id="..."}` — Google Drive video embed (used for the welcome video)
  - `::callout{kind="tip|info|warning"}` — Carbon-styled notes

## Development

```bash
npm install
npm run dev       # dev server on http://localhost:3000
npm run generate  # static site into .output/public
npm run build     # SSR build
```

## Content layout

```
content/
├── index.md                  # Home
├── 1.getting-started/        # Welcome video, how to use the program, disclaimer
├── 2.lessons/                # 20-lesson video curriculum
├── 3.training-tips/          # Success tip sheet, shadow boxing, partner/sparring, bag work, drills
├── 4.basic-plan/             # Beginner plan: overview, workouts, videos
└── 5.competitive-plan/       # Competitive plan: overview, weeks 1–5, videos
```

The sidebar navigation, breadcrumbs and prev/next links are generated from this tree.
