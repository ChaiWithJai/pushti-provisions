<script setup lang="ts">
import basic from '~/data/videos/basic-plan.json'
import competitive from '~/data/videos/competitive-plan.json'

const props = defineProps({
  plan: { type: String, required: true } // 'basic' | 'competitive'
})

const source = computed(() => (props.plan === 'competitive' ? competitive : basic))
const shorts = computed(() => source.value.orderedUnique.filter((v) => v.kind === 'short'))
const fulls = computed(() => source.value.orderedUnique.filter((v) => v.kind === 'video'))
</script>

<template>
  <div class="video-gallery">
    <template v-if="fulls.length">
      <h3>Full-length lessons referenced in this plan ({{ fulls.length }})</h3>
      <div class="video-gallery__grid video-gallery__grid--wide">
        <VideoEmbed v-for="v in fulls" :key="v.id" :id="v.id" />
      </div>
    </template>
    <template v-if="shorts.length">
      <h3>Drill demonstrations ({{ shorts.length }} shorts)</h3>
      <p class="video-gallery__note">
        Shown in the order they are linked throughout the plan. Titles load automatically; tap any
        card to play.
      </p>
      <div class="video-gallery__grid">
        <VideoEmbed v-for="v in shorts" :key="v.id" :id="v.id" short />
      </div>
    </template>
  </div>
</template>

<style scoped>
.video-gallery h3 {
  margin-top: 2rem;
}

.video-gallery__note {
  font-size: 0.875rem;
  color: var(--cds-text-secondary, #525252);
}

.video-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
  gap: 1rem;
}

.video-gallery__grid--wide {
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
}

.video-gallery__grid :deep(.video-embed) {
  margin: 0;
}

.video-gallery__grid :deep(.video-embed--short) {
  max-width: none;
}
</style>
