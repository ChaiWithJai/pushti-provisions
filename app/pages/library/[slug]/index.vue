<script setup lang="ts">
import { ArrowRight20 as ArrowRight, DocumentPdf20 as DocumentPdf, Play16 as Play } from '@carbon/icons-vue'
import { getDocument, uniqueVideos } from '~/data/library'

const route = useRoute()
const slug = String(route.params.slug)
const document = getDocument(slug)
if (!document) throw createError({ statusCode: 404, statusMessage: 'Document not found' })

useSeoMeta({
  title: document.source.title,
  description: document.source.description
})
</script>

<template>
  <div class="document-overview">
    <section class="document-hero">
      <div class="breadcrumb"><NuxtLink to="/">Library</NuxtLink><span>/</span><span>{{ document.source.title }}</span></div>
      <div class="document-hero-grid">
        <div>
          <p class="eyebrow">{{ document.source.edition }}</p>
          <h1>{{ document.source.title }}</h1>
          <p class="document-description">{{ document.source.description }}</p>
          <SourceMeta :document="document" />
        </div>
        <dl class="source-summary">
          <div><dt>Pages</dt><dd>{{ document.stats.pages }}</dd></div>
          <div><dt>Text blocks</dt><dd>{{ document.stats.blocks.toLocaleString() }}</dd></div>
          <div><dt>Unique videos</dt><dd>{{ uniqueVideos(document) }}</dd></div>
          <div><dt>Source integrity</dt><dd class="hash">SHA-256<br>{{ document.source.sha256.slice(0, 16) }}...</dd></div>
        </dl>
      </div>
    </section>

    <section class="page-index content-section">
      <div class="section-heading section-heading--compact">
        <p class="eyebrow">Contents</p>
        <h2>Read page by page</h2>
        <p>Titles are inferred from the source hierarchy. Open any lesson to read the complete source page with its associated demonstrations and on-page outline.</p>
      </div>
      <div class="page-list">
        <NuxtLink
          v-for="page in document.pages"
          :key="page.number"
          class="page-row"
          :to="`/library/${document.source.slug}/${page.number}`"
        >
          <span class="page-number">{{ String(page.number).padStart(2, '0') }}</span>
          <div><h3>{{ page.title }}</h3><p>{{ page.text.slice(0, 150) }}{{ page.text.length > 150 ? '...' : '' }}</p></div>
          <span v-if="page.links.some(link => link.video)" class="cds--tag cds--tag--red"><Play :size="14" /> Video</span>
          <DocumentPdf v-else :size="20" class="page-type-icon" />
          <ArrowRight :size="20" class="page-arrow" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
