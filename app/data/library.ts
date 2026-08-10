import guides from '../../content/boxing/guides-and-tips.json'
import basic from '../../content/boxing/basic-workout-plan.json'
import competitive from '../../content/boxing/competitive-workout-plan.json'
import programCatalog from '../../content/boxing/programs.json'
import type { BoxingDocument, TrainingProgram } from '~/types/content'

export const documents = [guides, basic, competitive] as BoxingDocument[]
export const programs = programCatalog.programs as TrainingProgram[]

export function getDocument(slug: string) {
  return documents.find(document => document.source.slug === slug)
}

export function uniqueVideos(document: BoxingDocument) {
  const videos = new Set<string>()
  for (const page of document.pages) {
    for (const link of page.links) {
      if (link.video) videos.add(link.video.id)
    }
  }
  return videos.size
}

export function getProgram(id: string) {
  return programs.find(program => program.id === id)
}

export function getTrainingLesson(programId: string, weekNumber: number, dayOfWeek: number) {
  const program = getProgram(programId)
  const week = program?.weeks.find(item => item.number === weekNumber)
  const lesson = week?.lessons.find(item => item.dayOfWeek === dayOfWeek)
  if (!program || !week || !lesson) return null
  const document = getDocument(program.sourceSlug)
  const page = document?.pages.find(item => item.number === lesson.sourcePage)
  const overviewPage = lesson.overviewPage
    ? document?.pages.find(item => item.number === lesson.overviewPage)
    : undefined
  if (!document || !page) return null
  const lessons = program.weeks.flatMap(item => item.lessons)
  const index = lessons.findIndex(item => item.id === lesson.id)
  return {
    program,
    week,
    lesson,
    page,
    overviewPage,
    previous: lessons[index - 1] ?? null,
    next: lessons[index + 1] ?? null
  }
}
