<script setup lang="ts">
import { Launch16 as Launch } from '@carbon/icons-vue'
import type { ContentLink } from '~/types/content'

const props = defineProps<{ links: ContentLink[] }>()
const deduped = computed(() => {
  const seen = new Set<string>()
  return props.links.filter((link) => {
    const key = link.video ? `youtube:${link.video.id}` : `${link.url}:${link.text}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})
const videos = computed(() => deduped.value.filter(link => link.video))
const otherLinks = computed(() => deduped.value.filter(link => !link.video))
</script>

<template>
  <div v-if="deduped.length" class="block-resources">
    <div v-if="videos.length" class="video-grid">
      <VideoEmbed v-for="link in videos" :key="`${link.url}-${link.text}`" :link="link" />
    </div>
    <ul v-if="otherLinks.length" class="resource-links" aria-label="Related resources">
      <li v-for="link in otherLinks" :key="`${link.url}-${link.text}`">
        <a :href="link.url" target="_blank" rel="noopener noreferrer">
          <span>{{ link.text }}</span><Launch :size="16" />
        </a>
      </li>
    </ul>
  </div>
</template>
