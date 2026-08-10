<script setup lang="ts">
import { ArrowRight20 as ArrowRight, Search20 as Search } from '@carbon/icons-vue'
import { documents } from '~/data/library'

useSeoMeta({ title: 'Search' })
const query = ref('')
const results = computed(() => {
  const term = query.value.trim().toLocaleLowerCase()
  if (term.length < 2) return []
  return documents.flatMap(document => document.pages
    .filter(page => page.text.toLocaleLowerCase().includes(term) || page.title.toLocaleLowerCase().includes(term))
    .map(page => ({ document, page })))
    .slice(0, 80)
})
</script>

<template>
  <div class="search-page content-section">
    <div class="breadcrumb"><NuxtLink to="/">Library</NuxtLink><span>/</span><span>Search</span></div>
    <div class="section-heading search-heading">
      <p class="eyebrow">Full library</p>
      <h1>Find a drill, lesson, or principle.</h1>
      <p>Search all 102 extracted source pages. Results always lead back to the canonical PDF page.</p>
    </div>
    <label class="cds--search cds--search--lg search-control">
      <span class="cds--label">Search</span>
      <Search :size="20" class="search-icon" />
      <input v-model="query" class="cds--search-input" type="search" placeholder="Try footwork, sparring, recovery..." autofocus>
    </label>
    <p v-if="query.trim().length >= 2" class="search-count">{{ results.length }} matching pages</p>
    <div class="search-results">
      <NuxtLink
        v-for="result in results"
        :key="`${result.document.source.slug}-${result.page.number}`"
        class="search-result"
        :to="`/library/${result.document.source.slug}/${result.page.number}`"
      >
        <p>{{ result.document.source.title }} / Page {{ result.page.number }}</p>
        <h2>{{ result.page.title }}</h2>
        <span>{{ result.page.text.slice(0, 220) }}...</span>
        <ArrowRight :size="20" />
      </NuxtLink>
    </div>
  </div>
</template>
