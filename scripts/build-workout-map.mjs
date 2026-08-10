// Builds data/videos/workout-map.json: for each plan, assigns every video
// link (in verified PDF annotation order) to the workout/PDF page it belongs
// to, using a dynamic-programming alignment between the ordered link
// sequence and the page-segmented PDF text, scored by fuzzy similarity
// between YouTube video titles (data/videos/titles.json) and page text.
//
// Run after scripts/fetch-titles.mjs has produced titles.json:
//   node scripts/build-workout-map.mjs
import { readFileSync, writeFileSync } from 'node:fs'

const titles = JSON.parse(readFileSync('data/videos/titles.json', 'utf8'))

// ---------- text utils ----------
const STOP = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'and', 'or', 'with', 'for', 'to', 'at'])

function tokens(s) {
  return String(s)
    .toLowerCase()
    .replace(/#\w+/g, ' ') // hashtags in titles
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t && !STOP.has(t) && t.length > 1)
}

function collapseDoubles(words) {
  const out = []
  for (const w of words) {
    if (out.length && out[out.length - 1] === w) continue
    out.push(w)
  }
  return out
}

function tokenSetSim(aTokens, bSet) {
  if (!aTokens.length) return 0
  let hit = 0
  for (const t of aTokens) if (bSet.has(t)) hit++
  return hit / aTokens.length
}

// ---------- parse a plan extraction ----------
function parsePlan(txtPath) {
  const lines = readFileSync(txtPath, 'utf8').split('\n')
  const linkStart = lines.findIndex((l) => l.trim().startsWith('<http'))
  const body = lines.slice(0, linkStart)
  const linkLines = lines.slice(linkStart).filter((l) => l.trim().startsWith('<'))

  // ordered link runs (consecutive duplicates collapsed)
  const runs = []
  for (const l of linkLines) {
    const m = l.match(/<(.*?)>/)
    if (!m) continue
    const url = m[1]
    const y = url.match(/(?:shorts\/|youtu\.be\/|v=)([\w-]{11})/)
    if (!y) {
      runs.push({ id: null, url, kind: 'ext' })
      continue
    }
    const id = y[1]
    const kind = url.includes('/shorts/') ? 'short' : 'video'
    const prev = runs[runs.length - 1]
    if (prev && prev.id === id) continue
    runs.push({ id, kind })
  }

  // page segmentation on "KO BOXING PACKAGE <n>" footers (words may be doubled)
  const pages = []
  let current = []
  const footer = /KO\s+(?:KO\s+)?BOXING\s+(?:BOXING\s+)?PACKAGE\s+(?:KO\s+BOXING\s+PACKAGE\s+)?(?:PACKAGE\s+)?(\d+)/i
  for (const raw of body) {
    const line = raw.replace(/\\([#!.])/g, '$1')
    if (footer.test(line)) {
      pages.push(current.join(' '))
      current = []
    } else {
      current.push(line)
    }
  }
  if (current.join(' ').trim()) pages.push(current.join(' '))

  return { runs, pages }
}

// label pages by the workout they contain
function labelPages(pages, planKind) {
  return pages.map((text, i) => {
    const clean = collapseDoubles(tokens(text)).join(' ')
    let label = null
    let m
    if ((m = clean.match(/boxing workout (\d+)/))) label = `workout-${String(m[1]).padStart(2, '0')}`
    else if ((m = clean.match(/active recovery workout (\d+)/))) label = `active-recovery-${m[1]}`
    else if ((m = clean.match(/endurance workout (\d+)/))) label = `endurance-${m[1]}`
    else if (/lift|weightlifting|barbell|deadlift|bench press/.test(clean)) label = 'weightlifting'
    else if (/recovery tips|nutrition|meal plan|calorie/.test(clean)) label = 'recovery'
    else label = null
    return { index: i, label, tokenSet: new Set(collapseDoubles(tokens(text))), text: clean.slice(0, 200) }
  })
}

// ---------- DP alignment: assign runs (ordered) to pages (ordered) ----------
function align(runs, pages) {
  const vids = runs.map((r, idx) => ({ ...r, idx })).filter((r) => r.id)
  const simRow = vids.map((v) => {
    const t = titles[v.id]?.title
    const tk = t ? tokens(t) : []
    return pages.map((p) => (tk.length ? tokenSetSim(tk, p.tokenSet) : 0.05))
  })

  const n = vids.length
  const p = pages.length
  // dp[i][j]: best score assigning first i runs with run i-1 on page j
  const NEG = -1e9
  const dp = Array.from({ length: n + 1 }, () => new Array(p).fill(NEG))
  const back = Array.from({ length: n + 1 }, () => new Array(p).fill(-1))
  for (let j = 0; j < p; j++) dp[0][j] = 0
  for (let i = 1; i <= n; i++) {
    let bestPrev = NEG
    let bestPrevJ = -1
    for (let j = 0; j < p; j++) {
      if (dp[i - 1][j] > bestPrev) {
        bestPrev = dp[i - 1][j]
        bestPrevJ = j
      }
      // runs must be non-decreasing in page index: best over j' <= j
      const score = bestPrev + simRow[i - 1][j]
      if (score > dp[i][j]) {
        dp[i][j] = score
        back[i][j] = bestPrevJ
      }
    }
  }
  // recover
  let j = 0
  let best = NEG
  for (let k = 0; k < p; k++) if (dp[n][k] > best) { best = dp[n][k]; j = k }
  const assign = new Array(n).fill(0)
  for (let i = n; i >= 1; i--) {
    assign[i - 1] = j
    j = back[i][j]
  }
  return { vids, assign, simRow }
}

// ---------- build map ----------
const result = {}
for (const [plan, txt] of [
  ['basic', 'canonical/basic-plan-extracted.txt'],
  ['competitive', 'canonical/competitive-plan-extracted.txt']
]) {
  const { runs, pages } = parsePlan(txt)
  const labeled = labelPages(pages, plan)
  const { vids, assign, simRow } = align(runs, labeled)

  const byLabel = {}
  const report = []
  vids.forEach((v, i) => {
    const page = labeled[assign[i]]
    const label = page.label ?? `page-${page.index}`
    byLabel[label] ??= []
    // dedupe within a page, keep order
    if (!byLabel[label].some((e) => e.id === v.id)) {
      byLabel[label].push({ id: v.id, kind: v.kind, sim: +simRow[i][assign[i]].toFixed(2) })
    }
    report.push({ id: v.id, title: titles[v.id]?.title ?? null, page: label, sim: +simRow[i][assign[i]].toFixed(2) })
  })
  result[plan] = byLabel
  writeFileSync(`data/videos/${plan}-alignment-report.json`, JSON.stringify(report, null, 1))
  const weak = report.filter((r) => r.sim < 0.34).length
  console.log(`${plan}: ${vids.length} link runs -> ${Object.keys(byLabel).length} pages; weak (<0.34) assignments: ${weak}`)
}

writeFileSync('data/videos/workout-map.json', JSON.stringify(result, null, 1))
console.log('wrote data/videos/workout-map.json')
