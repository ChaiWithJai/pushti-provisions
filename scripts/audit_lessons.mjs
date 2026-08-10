import { readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const load = async file => JSON.parse(await readFile(new URL(file, root), 'utf8'))
const catalog = await load('content/boxing/programs.json')
const documents = new Map()
for (const file of ['basic-workout-plan.json', 'competitive-workout-plan.json']) {
  const document = await load(`content/boxing/${file}`)
  documents.set(document.source.slug, document)
}

const lessons = []
const totals = { programs: catalog.programs.length, lessons: 0, sections: 0, blocks: 0, resources: 0, videos: 0, rawAnnotations: 0 }

for (const program of catalog.programs) {
  const document = documents.get(program.sourceSlug)
  for (const week of program.weeks) {
    for (const lesson of week.lessons) {
      const page = document.pages.find(item => item.number === lesson.sourcePage)
      const issues = []
      const sectionBlockIds = page.sections.flatMap(section => section.blocks.map(block => block.id))
      const allBlockIds = page.blocks.map(block => block.id)
      if (new Set(sectionBlockIds).size !== allBlockIds.length || sectionBlockIds.length !== allBlockIds.length) {
        issues.push('Section membership does not cover every source block exactly once.')
      }
      if (page.audit.coverage !== 1 || page.audit.visibleWords !== page.audit.representedWords) {
        issues.push('Visible PDF text is not fully represented.')
      }
      for (const section of page.sections) {
        const sectionIds = new Set(section.blocks.map(block => block.id))
        const resourceKeys = new Set()
        for (const link of section.links) {
          if (!sectionIds.has(link.blockId)) issues.push(`${link.text}: resource owner is outside ${section.id}.`)
          const key = `${link.video?.key ?? link.url}:${link.blockId}`
          if (resourceKeys.has(key)) issues.push(`${link.text}: duplicate resource in ${section.id}.`)
          resourceKeys.add(key)
          if (link.video?.start && !link.video.embedUrl.includes(`start=${link.video.start}`)) {
            issues.push(`${link.text}: YouTube start time was not preserved.`)
          }
        }
      }
      const record = {
        program: program.id,
        week: week.number,
        day: lesson.day,
        href: lesson.href,
        sourcePage: lesson.sourcePage,
        sourceTitle: page.title,
        visibleWords: page.audit.visibleWords,
        rawAnnotations: page.audit.rawAnnotations,
        resolvedResources: page.audit.resolvedResources,
        sections: page.sections.map(section => ({
          id: section.id,
          kind: section.kind,
          title: section.title,
          blocks: section.blocks.length,
          resources: section.links.length,
          videos: section.links.filter(link => link.video).map(link => ({
            key: link.video.key,
            label: link.text,
            url: link.url,
          })),
        })),
        status: issues.length ? 'fail' : 'pass',
        issues,
      }
      lessons.push(record)
      totals.lessons += 1
      totals.sections += page.sections.length
      totals.blocks += page.blocks.length
      totals.resources += page.links.length
      totals.videos += page.links.filter(link => link.video).length
      totals.rawAnnotations += page.audit.rawAnnotations
    }
  }
}

const failed = lessons.filter(item => item.status === 'fail')
const report = {
  schemaVersion: 1,
  authority: 'The canonical PDF page geometry, visible text layer, and URI annotations.',
  method: 'Each scheduled lesson is checked page-by-page and section-by-section for exact block coverage, resource ownership, annotation deduplication, and YouTube timestamp preservation.',
  totals,
  status: failed.length ? 'fail' : 'pass',
  failedLessons: failed.length,
  lessons,
}

await writeFile(new URL('content/boxing/lesson-audit.json', root), `${JSON.stringify(report, null, 2)}\n`)
console.log(JSON.stringify({ ...totals, failedLessons: failed.length, status: report.status }, null, 2))
if (failed.length) process.exitCode = 1
