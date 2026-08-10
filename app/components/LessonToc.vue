<script setup lang="ts">
import type { ContentBlock } from '~/types/content'

const props = defineProps<{ blocks: ContentBlock[] }>()
const headings = computed(() => {
  const seen = new Set<string>()
  return props.blocks.filter((block) => {
    if (block.type !== 'heading' || block.text.length < 3) return false
    const key = block.text.toLocaleLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, 18)
})
</script>

<template>
  <nav v-if="headings.length" class="lesson-toc" aria-label="On this lesson">
    <h2>On this lesson</h2>
    <ol>
      <li v-for="heading in headings" :key="heading.id">
        <a :href="`#${heading.id}`">{{ heading.text }}</a>
      </li>
    </ol>
  </nav>
</template>
