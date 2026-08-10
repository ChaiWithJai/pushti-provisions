export interface VideoData {
  id: string
  key: string
  start: number
  short: boolean
  embedUrl: string
  thumbnailUrl: string
}

export interface ContentLink {
  text: string
  url: string
  kind: 'youtube' | 'instagram' | 'external'
  rect: number[]
  blockId?: string
  sectionId?: string
  annotationCount?: number
  video?: VideoData
}

export interface ContentBlock {
  id: string
  type: 'title' | 'heading' | 'paragraph' | 'marker'
  text: string
  bbox: number[]
  size: number
  links: ContentLink[]
}

export interface ContentSection {
  id: string
  kind: 'header' | 'drill' | 'recovery' | 'supplement' | 'checklist'
  title: string
  bbox: number[]
  blocks: ContentBlock[]
  links: ContentLink[]
}

export interface ContentPage {
  number: number
  title: string
  width: number
  height: number
  text: string
  blocks: ContentBlock[]
  sections: ContentSection[]
  links: ContentLink[]
  audit: {
    visibleWords: number
    representedWords: number
    coverage: number
    removedOverlays: number
    removedDecorations: number
    rawAnnotations: number
    resolvedResources: number
  }
}

export interface BoxingDocument {
  schemaVersion: number
  source: {
    slug: string
    title: string
    edition: string
    filename: string
    driveUrl: string
    pdfUrl: string
    description: string
    sha256: string
    pageCount: number
  }
  stats: {
    pages: number
    blocks: number
    links: number
    youtubeVideos: number
  }
  pages: ContentPage[]
}

export interface TrainingLesson {
  id: string
  day: number
  week: number
  dayOfWeek: number
  title: string
  shortTitle: string
  role: string
  sourcePage: number
  overviewPage: number | null
  summary: string
  durationLabel: string
  videoCount: number
  prerequisiteLessonId: string | null
  cognitiveLoad: number
  objective: string
  observableBehavior: string
  assessment: string
  transfer: string
  href: string
}

export interface TrainingWeek {
  number: number
  stage: string
  title: string
  description: string
  overviewPage?: number
  lessons: TrainingLesson[]
}

export interface TrainingProgram {
  id: 'basic' | 'competitive'
  title: string
  eyebrow: string
  description: string
  sourceSlug: string
  sourceTitle: string
  pdfUrl: string
  sha256: string
  weeks: TrainingWeek[]
}
