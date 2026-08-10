<script setup lang="ts">
import map from '~/data/videos/workout-map.json'
import titles from '~/data/videos/titles.json'

const props = defineProps({
  plan: { type: String, required: true }, // 'basic' | 'competitive'
  page: { type: String, required: true }, // e.g. 'workout-01', 'endurance-2'
  pages: { type: String, default: '' } // optional comma list to merge several PDF pages
})

interface Entry {
  id: string
  kind: string
  sim?: number
}

const entries = computed<Entry[]>(() => {
  const planMap = (map as Record<string, Record<string, Entry[]>>)[props.plan] ?? {}
  const keys = props.pages ? props.pages.split(',').map((s) => s.trim()) : [props.page]
  const seen = new Set<string>()
  const out: Entry[] = []
  for (const k of keys) {
    for (const e of planMap[k] ?? []) {
      if (!seen.has(e.id)) {
        seen.add(e.id)
        out.push(e)
      }
    }
  }
  return out
})

function titleOf(id: string): string {
  return (titles as Record<string, { title?: string | null }>)[id]?.title ?? ''
}
</script>

<template>
  <section v-if="entries.length" class="workout-videos">
    <h2>Video demonstrations</h2>
    <p class="workout-videos__note">
      The demonstrations linked from this part of the original PDF. Tap a card to play.
    </p>
    <div class="workout-videos__grid">
      <VideoEmbed
        v-for="e in entries"
        :key="e.id"
        :id="e.id"
        :title="titleOf(e.id)"
        :short="e.kind === 'short'"
      />
    </div>
  </section>
</template>

<style scoped>
.workout-videos__note {
  font-size: 0.875rem;
  color: var(--cds-text-secondary, #525252);
}

.workout-videos__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
  gap: 1rem;
}

.workout-videos__grid :deep(.video-embed) {
  margin: 0;
}

.workout-videos__grid :deep(.video-embed--short) {
  max-width: none;
}
</style>
