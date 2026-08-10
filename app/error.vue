<script setup lang="ts">
import type { NuxtError } from '#app'
defineProps<{ error: NuxtError }>()
</script>

<template>
  <div class="error-page">
    <p class="eyebrow">{{ error.statusCode }}</p>
    <h1>{{ error.statusMessage || 'Page not found' }}</h1>
    <NuxtLink class="cds--btn cds--btn--primary" to="/">Return to the library</NuxtLink>
  </div>
</template>
