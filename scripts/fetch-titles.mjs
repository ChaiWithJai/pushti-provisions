// Fetches YouTube titles for every video referenced by the wiki via the
// public oEmbed endpoint, and writes them to data/videos/titles.json.
// Run in an environment with open network access (e.g. GitHub Actions):
//   node scripts/fetch-titles.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const files = [
  'data/videos/lessons.json',
  'data/videos/basic-plan.json',
  'data/videos/competitive-plan.json'
]

const ids = new Set()
for (const f of files) {
  const data = JSON.parse(readFileSync(f, 'utf8'))
  if (Array.isArray(data)) {
    for (const l of data) ids.add(l.videoId)
  } else {
    for (const v of data.orderedUnique ?? []) ids.add(v.id)
  }
}

// IDs from precise PDF link extractions, when present
for (const plan of ['basic', 'competitive']) {
  const f = `canonical/${plan}-plan-links.json`
  if (!existsSync(f)) continue
  const { pages } = JSON.parse(readFileSync(f, 'utf8'))
  for (const p of pages) {
    for (const l of p.links) {
      const m = String(l.uri).match(/(?:shorts\/|youtu\.be\/|v=)([\w-]{11})/)
      if (m) ids.add(m[1])
    }
  }
}

const out = existsSync('data/videos/titles.json')
  ? JSON.parse(readFileSync('data/videos/titles.json', 'utf8'))
  : {}

let fetched = 0
let failed = 0
for (const id of ids) {
  if (out[id]?.title) continue
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${id}`
  )}&format=json`
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } })
    if (r.ok) {
      const j = await r.json()
      out[id] = { title: j.title ?? null, author: j.author_name ?? null }
      fetched++
    } else {
      out[id] = { title: null, status: r.status }
      failed++
    }
  } catch (e) {
    out[id] = { title: null, error: String(e?.message ?? e) }
    failed++
  }
  // stay polite
  await new Promise((res) => setTimeout(res, 120))
}

writeFileSync('data/videos/titles.json', JSON.stringify(out, null, 1) + '\n')
console.log(`ids: ${ids.size}, fetched now: ${fetched}, failed: ${failed}`)
