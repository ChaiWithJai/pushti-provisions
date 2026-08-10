<script setup lang="ts">
import { Launch16 as Launch, PlayFilledAlt32 as PlayFilledAlt } from '@carbon/icons-vue'
import type { ContentLink } from '~/types/content'

const props = defineProps<{ link: ContentLink }>()
const playing = ref(false)
const label = computed(() => props.link.text || 'Video demonstration')
</script>

<template>
  <article v-if="link.video" class="video-card" :class="{ 'video-card--short': link.video.short }">
    <div class="video-frame">
      <iframe
        v-if="playing"
        :src="`${link.video.embedUrl}&autoplay=1`"
        :title="label"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      />
      <button v-else class="video-poster" :aria-label="`Play ${label}`" @click="playing = true">
        <img :src="link.video.thumbnailUrl" alt="" loading="lazy">
        <span class="video-play"><PlayFilledAlt :size="32" /></span>
      </button>
    </div>
    <div class="video-caption">
      <span class="cds--tag cds--tag--red">Video</span>
      <p>{{ label }}</p>
      <a :href="link.url" target="_blank" rel="noopener noreferrer" aria-label="Open video on YouTube">
        <Launch :size="16" />
      </a>
    </div>
  </article>
</template>
