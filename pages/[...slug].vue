<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(`page-${route.path}`, () =>
  queryContent(route.path === '/' ? '/' : route.path.replace(/\/$/, '')).findOne()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const [prev, next] = await queryContent()
  .only(['_path', 'title'])
  .sort({ _file: 1 })
  .findSurround(page.value._path)
  .catch(() => [null, null])

useHead({
  title: `${page.value.title} — KO Boxing Package Wiki`,
  meta: [{ name: 'description', content: page.value.description ?? '' }]
})
</script>

<template>
  <div class="app-content">
    <Breadcrumbs :path="page?._path ?? '/'" />
    <article class="wiki-prose">
      <ContentRenderer v-if="page" :value="page" />
    </article>
    <nav v-if="prev || next" class="page-surround" aria-label="Adjacent pages">
      <NuxtLink v-if="prev" :to="prev._path">
        <span class="surround-label">← Previous</span>
        <span class="surround-title">{{ prev.title }}</span>
      </NuxtLink>
      <span v-else />
      <NuxtLink v-if="next" :to="next._path" class="surround-next">
        <span class="surround-label">Next →</span>
        <span class="surround-title">{{ next.title }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>
