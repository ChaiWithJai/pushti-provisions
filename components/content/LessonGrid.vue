<script setup lang="ts">
import lessons from '~/data/videos/lessons.json'

const props = defineProps({
  part: { type: Number, default: 0 } // 0 = all
})

const items = computed(() =>
  props.part ? lessons.filter((l) => l.part === props.part) : lessons
)
</script>

<template>
  <div class="lesson-grid">
    <section v-for="lesson in items" :id="lesson.slug" :key="lesson.slug" class="lesson">
      <h3>{{ lesson.title }}</h3>
      <p v-if="lesson.blurb" class="lesson__blurb">{{ lesson.blurb }}</p>
      <VideoEmbed :id="lesson.videoId" :title="lesson.title" />
    </section>
  </div>
</template>

<style scoped>
.lesson {
  margin-bottom: 1rem;
}

.lesson__blurb {
  font-size: 0.9375rem;
  color: var(--cds-text-secondary, #525252);
}

.lesson :deep(.video-embed) {
  margin-top: 0.75rem;
}
</style>
