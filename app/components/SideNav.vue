<script setup lang="ts">
import { Close20 as Close, Document16 as Document, Home16 as Home, Search16 as Search } from '@carbon/icons-vue'
import { documents } from '~/data/library'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()
</script>

<template>
  <aside class="side-nav" :class="{ 'side-nav--open': open }" aria-label="Training library">
    <div class="side-nav-mobile-head">
      <span>Library</span>
      <button class="icon-button" aria-label="Close navigation" @click="$emit('close')"><Close :size="20" /></button>
    </div>
    <nav>
      <p class="side-nav-label">Overview</p>
      <NuxtLink class="side-nav-link" to="/"><Home :size="16" />Start here</NuxtLink>
      <NuxtLink class="side-nav-link" to="/search"><Search :size="16" />Search</NuxtLink>
      <p class="side-nav-label side-nav-label--spaced">Canonical sources</p>
      <NuxtLink
        v-for="document in documents"
        :key="document.source.slug"
        class="side-nav-link"
        :to="`/library/${document.source.slug}`"
      >
        <Document :size="16" />
        <span>{{ document.source.title }}<small>{{ document.source.pageCount }} pages</small></span>
      </NuxtLink>
    </nav>
    <div class="side-nav-foot">
      <span class="status-dot" />
      Generated from 3 source PDFs
    </div>
  </aside>
</template>
