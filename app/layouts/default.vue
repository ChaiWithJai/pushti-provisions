<script setup lang="ts">
const navOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { navOpen.value = false })
</script>

<template>
  <div class="app-shell">
    <AppHeader @toggle-navigation="navOpen = !navOpen" />
    <SideNav :open="navOpen" @close="navOpen = false" />
    <main id="main-content" class="main-content">
      <slot />
    </main>
    <button v-if="navOpen" class="nav-scrim" aria-label="Close navigation" @click="navOpen = false" />
  </div>
</template>
