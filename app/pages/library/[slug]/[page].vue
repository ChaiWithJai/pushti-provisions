<script setup lang="ts">
import { ArrowLeft20 as ArrowLeft, ArrowRight20 as ArrowRight, Download16 as Download, Launch16 as Launch } from '@carbon/icons-vue'
import { getDocument } from '~/data/library'

const route = useRoute()
const slug = String(route.params.slug)
const pageNumber = Number(route.params.page)
const document = getDocument(slug)
const page = document?.pages.find(item => item.number === pageNumber)
if (!document || !page) throw createError({ statusCode: 404, statusMessage: 'Source page not found' })

const previous = document.pages.find(item => item.number === pageNumber - 1)
const next = document.pages.find(item => item.number === pageNumber + 1)
const videoCount = new Set(page.links.filter(link => link.video).map(link => link.video!.id)).size
const leadLink = page.links.find(link => link.video)
const blockLinks = (links: typeof page.links) => links.filter(link => link !== leadLink)

useSeoMeta({
  title: `${page.title} - ${document.source.title}`,
  description: page.text.slice(0, 155)
})
</script>

<template>
  <article class="reader-page">
    <header class="reader-head">
      <div class="breadcrumb">
        <NuxtLink to="/">Library</NuxtLink><span>/</span>
        <NuxtLink :to="`/library/${document.source.slug}`">{{ document.source.title }}</NuxtLink><span>/</span>
        <span>Page {{ page.number }}</span>
      </div>
      <div class="reader-heading-row">
        <div>
          <p class="eyebrow">Page {{ page.number }} of {{ document.source.pageCount }}</p>
          <h1>{{ page.title }}</h1>
        </div>
        <a class="cds--btn cds--btn--ghost" :href="document.source.pdfUrl" download><Download :size="16" /> PDF</a>
      </div>
      <div class="reader-meta">
        <span>{{ page.blocks.length }} text blocks</span>
        <span>{{ page.links.length }} source links</span>
        <span v-if="videoCount">{{ videoCount }} unique videos</span>
      </div>
    </header>

    <div class="source-notice">
      <strong>Source-aligned view</strong>
      <p>Text follows the source page reading order. Linked demonstrations appear directly after the block their PDF annotation overlaps.</p>
      <a :href="`${document.source.pdfUrl}#page=${page.number}`" target="_blank">Inspect page {{ page.number }} <Launch :size="16" /></a>
    </div>

    <section v-if="leadLink" class="lesson-lead" aria-label="Lead demonstration">
      <p class="eyebrow">Lead demonstration</p>
      <VideoEmbed :link="leadLink" />
    </section>

    <div class="lesson-layout">
      <section id="lesson-content" class="extracted-content" :aria-label="`Extracted lesson from page ${page.number}`">
        <div v-for="block in page.blocks" :id="block.id" :key="block.id" class="content-block">
          <h2 v-if="block.type === 'heading' && block.text.length > 2">{{ block.text }}</h2>
          <p v-else>{{ block.text }}</p>
          <BlockResources :links="blockLinks(block.links)" />
        </div>
      </section>
      <aside class="lesson-rail"><LessonToc :blocks="page.blocks" /></aside>
    </div>

    <nav class="reader-pagination" aria-label="Document pages">
      <NuxtLink v-if="previous" :to="`/library/${document.source.slug}/${previous.number}`" class="pagination-link pagination-link--previous">
        <span><ArrowLeft :size="20" /> Previous</span><strong>{{ previous.title }}</strong>
      </NuxtLink>
      <span v-else />
      <NuxtLink v-if="next" :to="`/library/${document.source.slug}/${next.number}`" class="pagination-link pagination-link--next">
        <span>Next <ArrowRight :size="20" /></span><strong>{{ next.title }}</strong>
      </NuxtLink>
    </nav>
  </article>
</template>
