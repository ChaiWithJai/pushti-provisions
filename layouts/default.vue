<script setup lang="ts">
const navOpen = ref(false)
const route = useRoute()
watch(() => route.path, () => { navOpen.value = false })

const { data: navigation } = await useAsyncData('navigation', () =>
  fetchContentNavigation()
)
</script>

<template>
  <div>
    <header class="site-header" data-carbon-theme="g100">
      <button
        class="app-sidenav-toggle site-header__menu"
        type="button"
        aria-label="Toggle navigation"
        @click="navOpen = !navOpen"
      >
        <svg viewBox="0 0 20 20" width="20" height="20" fill="currentColor" aria-hidden="true">
          <rect x="2" y="4.5" width="16" height="1.5" />
          <rect x="2" y="9.25" width="16" height="1.5" />
          <rect x="2" y="14" width="16" height="1.5" />
        </svg>
      </button>
      <NuxtLink to="/" class="site-header__name">
        KO&nbsp;<span>Boxing Package</span><em>Training Wiki</em>
      </NuxtLink>
      <div class="site-header__spacer" />
      <a
        class="site-header__action"
        href="https://koboxingpackage.weblium.site/"
        target="_blank"
        rel="noopener"
      >Official site ↗</a>
    </header>

    <div class="app-shell">
      <nav class="app-sidenav" :class="{ 'is-open': navOpen }" aria-label="Wiki navigation">
        <SideNav :items="navigation ?? []" />
      </nav>
      <main class="app-main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3rem;
  display: flex;
  align-items: center;
  z-index: 200;
  border-bottom: 1px solid var(--cds-border-subtle-00, #393939);
}

.site-header__menu {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 0;
  color: var(--cds-icon-primary, #f4f4f4);
  cursor: pointer;
}

.site-header__menu:hover {
  background: var(--cds-layer-hover-01, #333333);
}

.site-header__name {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  padding: 0 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.1px;
  color: var(--cds-text-primary, #f4f4f4);
  text-decoration: none;
  height: 3rem;
  align-items: center;
}

.site-header__name span {
  font-weight: 400;
}

.site-header__name em {
  font-style: normal;
  font-weight: 400;
  font-size: 0.75rem;
  color: var(--cds-text-secondary, #c6c6c6);
  margin-left: 0.75rem;
  padding-left: 0.75rem;
  border-left: 1px solid var(--cds-border-subtle-00, #525252);
}

.site-header__spacer {
  flex: 1;
}

.site-header__action {
  font-size: 0.75rem;
  color: var(--cds-text-secondary, #c6c6c6);
  text-decoration: none;
  padding: 0 1rem;
  height: 3rem;
  display: flex;
  align-items: center;
}

.site-header__action:hover {
  color: var(--cds-text-primary, #f4f4f4);
  background: var(--cds-layer-hover-01, #333333);
}

@media (max-width: 42rem) {
  .site-header__name em {
    display: none;
  }
}
</style>
