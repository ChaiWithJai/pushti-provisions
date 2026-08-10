import { readFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const load = async file => JSON.parse(await readFile(new URL(file, root), 'utf8'))
const catalog = await load('content/boxing/programs.json')
const report = await load('content/boxing/instructional-design.json')
const lessonAudit = await load('content/boxing/lesson-audit.json')
const docs = new Map()
for (const file of ['basic-workout-plan.json', 'competitive-workout-plan.json']) {
  const doc = await load(`content/boxing/${file}`)
  docs.set(doc.source.slug, doc)
}

const fail = message => { throw new Error(message) }
if (catalog.programs.length !== 2) fail('Expected exactly two programs')
const routes = new Set()
let lessonCount = 0
let annotationCount = 0
let videoCount = 0

for (const program of catalog.programs) {
  if (program.weeks.length !== 5) fail(`${program.id}: expected five weeks`)
  const doc = docs.get(program.sourceSlug)
  if (!doc) fail(`${program.id}: source document missing`)
  if (doc.schemaVersion !== 2) fail(`${program.id}: expected link-aware section schema v2`)
  const expectedPages = new Set()
  for (const week of program.weeks) {
    if (week.lessons.length !== 7) fail(`${program.id} week ${week.number}: expected seven days`)
    for (const lesson of week.lessons) {
      lessonCount += 1
      if (routes.has(lesson.href)) fail(`Duplicate route ${lesson.href}`)
      routes.add(lesson.href)
      if (lesson.week !== week.number || lesson.day !== (week.number - 1) * 7 + lesson.dayOfWeek) fail(`${lesson.id}: invalid schedule coordinates`)
      if (!lesson.objective || !lesson.observableBehavior || !lesson.assessment || !lesson.transfer) fail(`${lesson.id}: incomplete learning metadata`)
      if (lesson.cognitiveLoad > .9) fail(`${lesson.id}: cognitive load exceeds gate`)
      const page = doc.pages.find(item => item.number === lesson.sourcePage)
      if (!page) fail(`${lesson.id}: source page ${lesson.sourcePage} missing`)
      if (expectedPages.has(page.number)) fail(`${lesson.id}: source page reused`)
      expectedPages.add(page.number)
      const blockIds = new Set(page.blocks.map(block => block.id))
      const sectionBlockIds = page.sections.flatMap(section => section.blocks.map(block => block.id))
      if (sectionBlockIds.length !== blockIds.size || new Set(sectionBlockIds).size !== blockIds.size) fail(`${lesson.id}: sections do not cover blocks exactly once`)
      if (page.audit.coverage !== 1 || page.audit.visibleWords !== page.audit.representedWords) fail(`${lesson.id}: visible source text coverage failed`)
      const sectionIds = new Set(page.sections.map(section => section.id))
      for (const link of page.links) {
        annotationCount += 1
        if (!link.blockId || !blockIds.has(link.blockId)) fail(`${lesson.id}: link missing valid owning block`)
        if (!link.sectionId || !sectionIds.has(link.sectionId)) fail(`${lesson.id}: link missing valid owning section`)
        if (link.video) {
          videoCount += 1
          if (!/^[\w-]{11}$/.test(link.video.id)) fail(`${lesson.id}: invalid YouTube id ${link.video.id}`)
          if (link.video.key !== `${link.video.id}:${link.video.start}`) fail(`${lesson.id}: invalid YouTube resource key`)
          if (!link.video.embedUrl.startsWith('https://www.youtube-nocookie.com/embed/')) fail(`${lesson.id}: non-private embed URL`)
          if (link.video.start && !link.video.embedUrl.includes(`start=${link.video.start}`)) fail(`${lesson.id}: YouTube start time missing from embed`)
        }
      }
    }
  }
  if (expectedPages.size !== 35) fail(`${program.id}: daily source page coverage is not 35`)
}

if (lessonCount !== 70) fail(`Expected 70 lessons, found ${lessonCount}`)
if (report.labeledContent.objectives.length !== lessonCount) fail('Objective coverage mismatch')
if (report.labeledContent.assessments.length !== lessonCount) fail('Assessment coverage mismatch')
if (report.validation.alignmentAnalysis.coverageRate !== 1) fail('Objective-assessment alignment is incomplete')
if (report.evaluation.compositeScore < .7) fail('Instructional-design score did not pass')
if (report.validation.criticalIssues.length) fail('Instructional-design report contains critical issues')
if (lessonAudit.status !== 'pass' || lessonAudit.failedLessons !== 0 || lessonAudit.lessons.length !== lessonCount) fail('Page-by-page lesson audit failed')

console.log(JSON.stringify({ programs: 2, weeks: 10, lessons: lessonCount, sourceAnnotations: annotationCount, youtubeAnnotations: videoCount, instructionalScore: Number(report.evaluation.compositeScore.toFixed(3)), status: 'pass' }, null, 2))
