import guides from '../../content/boxing/guides-and-tips.json'
import basic from '../../content/boxing/basic-workout-plan.json'
import competitive from '../../content/boxing/competitive-workout-plan.json'
import type { BoxingDocument } from '~/types/content'

export const documents = [guides, basic, competitive] as BoxingDocument[]

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
