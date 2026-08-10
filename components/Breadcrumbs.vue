<script setup lang="ts">
const props = defineProps<{ path: string }>()

const crumbs = computed(() => {
  const parts = props.path.split('/').filter(Boolean)
  const acc: { to: string; label: string }[] = []
  let current = ''
  for (const part of parts.slice(0, -1)) {
    current += `/${part}`
    acc.push({
      to: current,
      label: part
        .replace(/^\d+\./, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
    })
  }
  return acc
})
</script>

<template>
  <nav v-if="crumbs.length" class="breadcrumbs" aria-label="Breadcrumb">
    <NuxtLink to="/">Home</NuxtLink>
    <template v-for="crumb in crumbs" :key="crumb.to">
      <span class="sep" aria-hidden="true">/</span>
      <NuxtLink :to="crumb.to">{{ crumb.label }}</NuxtLink>
    </template>
  </nav>
</template>

<style scoped>
.breadcrumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.breadcrumbs a {
  color: var(--cds-link-primary, #0f62fe);
  text-decoration: none;
}

.breadcrumbs a:hover {
  text-decoration: underline;
}

.sep {
  color: var(--cds-text-secondary, #525252);
}
</style>
