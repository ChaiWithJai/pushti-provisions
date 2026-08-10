<script setup lang="ts">
defineProps<{ error: { statusCode: number; statusMessage?: string } }>()
</script>

<template>
  <div class="error-page" data-carbon-theme="g100">
    <div>
      <p class="error-code">{{ error.statusCode }}</p>
      <h1>{{ error.statusCode === 404 ? 'Page not found' : 'Something went wrong' }}</h1>
      <p class="error-hint">The page you're looking for isn't in this corner of the ring.</p>
      <button type="button" class="error-btn" @click="clearError({ redirect: '/' })">
        Back to the wiki
      </button>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'IBM Plex Sans', system-ui, sans-serif;
}

.error-code {
  font-size: 4rem;
  font-weight: 300;
  margin: 0;
  color: var(--cds-text-secondary, #c6c6c6);
}

h1 {
  font-size: 2rem;
  font-weight: 400;
  margin: 0.5rem 0 1rem;
}

.error-hint {
  color: var(--cds-text-secondary, #c6c6c6);
  margin-bottom: 2rem;
}

.error-btn {
  background: var(--cds-button-primary, #0f62fe);
  color: #fff;
  border: 0;
  padding: 0.875rem 4rem 0.875rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.error-btn:hover {
  background: var(--cds-button-primary-hover, #0353e9);
}
</style>
