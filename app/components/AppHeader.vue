<script setup lang="ts">
import { Menu20 as Menu } from '@carbon/icons-vue'
defineEmits<{ 'toggle-navigation': [] }>()
</script>

<template>
  <header class="site-header" aria-label="KO Boxing Training">
    <button class="cds--header__action mobile-menu" aria-label="Open navigation" @click="$emit('toggle-navigation')">
      <Menu :size="20" />
    </button>
    <div class="header-breadcrumb"><NuxtLink to="/">Training</NuxtLink><span>/</span><span>KO Boxing</span></div>
    <nav class="header-links" aria-label="Site">
      <NuxtLink to="/">Programs</NuxtLink>
      <NuxtLink to="/library/guides-and-tips">Technique guide</NuxtLink>
    </nav>
  </header>
</template>
