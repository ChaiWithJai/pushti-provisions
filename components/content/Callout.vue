<script setup lang="ts">
const props = defineProps({
  kind: { type: String, default: 'info' }, // info | tip | warning
  title: { type: String, default: '' }
})

const heading = computed(
  () => props.title || { info: 'Note', tip: 'Tip', warning: 'Important' }[props.kind] || 'Note'
)
</script>

<template>
  <aside class="callout" :class="`callout--${kind}`">
    <p class="callout__title">{{ heading }}</p>
    <div class="callout__body">
      <slot />
    </div>
  </aside>
</template>

<style scoped>
.callout {
  margin: 1.5rem 0;
  padding: 1rem 1rem 0.75rem;
  background: var(--cds-layer-01, #f4f4f4);
  border-left: 3px solid var(--cds-support-info, #0043ce);
}

.callout--tip {
  border-left-color: var(--cds-support-success, #24a148);
}

.callout--warning {
  border-left-color: var(--cds-support-warning, #f1c21b);
}

.callout__title {
  margin: 0 0 0.25rem !important;
  font-size: 0.875rem !important;
  font-weight: 600;
}

.callout__body :deep(p) {
  font-size: 0.9375rem;
  margin-bottom: 0.75rem;
}

.callout__body :deep(p:last-child) {
  margin-bottom: 0.25rem;
}
</style>
