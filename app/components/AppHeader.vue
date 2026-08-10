<script setup lang="ts">
import { Menu20 as Menu, Search20 as Search } from '@carbon/icons-vue'
defineEmits<{ 'toggle-navigation': [] }>()
</script>

<template>
  <header class="cds--header site-header" aria-label="KO Boxing Library">
    <button class="cds--header__action mobile-menu" aria-label="Open navigation" @click="$emit('toggle-navigation')">
      <Menu :size="20" />
    </button>
    <NuxtLink class="cds--header__name brand" to="/">
      <span class="brand-mark">KO</span>
      <span><strong>Boxing</strong> Library</span>
    </NuxtLink>
    <span class="header-divider" />
    <span class="header-context">Canonical training system</span>
    <NuxtLink class="cds--header__action header-search" to="/search" aria-label="Search the library">
      <Search :size="20" />
    </NuxtLink>
  </header>
</template>
