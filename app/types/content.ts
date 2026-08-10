export interface VideoData {
  id: string
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
  video?: VideoData
}

export interface ContentBlock {
  id: string
  type: 'heading' | 'paragraph'
  text: string
  bbox: number[]
  size: number
  links: ContentLink[]
}

export interface ContentPage {
  number: number
  title: string
  width: number
  height: number
  text: string
  blocks: ContentBlock[]
  links: ContentLink[]
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
