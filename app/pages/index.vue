<script setup lang="ts">
import { ArrowRight20 as ArrowRight, Book32 as Book, Document32 as Document, Play24 as Play, Search20 as Search } from '@carbon/icons-vue'
import { documents, uniqueVideos } from '~/data/library'

useSeoMeta({ title: 'Start here' })

const totals = computed(() => ({
  pages: documents.reduce((sum, document) => sum + document.stats.pages, 0),
  videos: documents.reduce((sum, document) => sum + uniqueVideos(document), 0),
  links: documents.reduce((sum, document) => sum + document.stats.links, 0)
}))
</script>

<template>
  <div>
    <section class="hero carbon-grid-full">
      <div class="hero-kicker"><span class="eyebrow-line" /> KO Boxing Package</div>
      <h1>Train with the source<br><em>in the room.</em></h1>
      <p class="hero-lead">
        A navigable training system generated directly from the original PDFs. Every drill, note, and linked demonstration stays connected to its source text.
      </p>
      <div class="hero-actions">
        <NuxtLink class="cds--btn cds--btn--primary" to="/library/guides-and-tips">Begin with the guide <ArrowRight :size="16" /></NuxtLink>
        <NuxtLink class="cds--btn cds--btn--ghost inverse-ghost" to="/search"><Search :size="16" />Search all training</NuxtLink>
      </div>
      <div class="hero-stats">
        <div><strong>{{ totals.pages }}</strong><span>Source pages</span></div>
        <div><strong>{{ totals.videos }}</strong><span>Unique videos</span></div>
        <div><strong>{{ totals.links.toLocaleString() }}</strong><span>Text-linked annotations</span></div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Choose your path</p>
        <h2>Three documents. One training library.</h2>
        <p>Start with fundamentals, follow the basic plan, or work through the competitive cycle. The PDF remains canonical at every step.</p>
      </div>

      <div class="document-grid">
        <NuxtLink
          v-for="(document, index) in documents"
          :key="document.source.slug"
          class="document-card"
          :to="`/library/${document.source.slug}`"
        >
          <span class="document-number">0{{ index + 1 }}</span>
          <component :is="index === 0 ? Book : Document" :size="32" class="document-icon" />
          <div>
            <p class="card-edition">{{ document.source.edition }}</p>
            <h3>{{ document.source.title }}</h3>
            <p>{{ document.source.description }}</p>
          </div>
          <dl class="card-stats">
            <div><dt>Pages</dt><dd>{{ document.stats.pages }}</dd></div>
            <div><dt>Videos</dt><dd>{{ uniqueVideos(document) }}</dd></div>
          </dl>
          <span class="card-arrow"><ArrowRight :size="20" /></span>
        </NuxtLink>
      </div>
    </section>

    <section class="method-section">
      <div class="method-copy">
        <p class="eyebrow eyebrow--light">Built for fidelity</p>
        <h2>The link belongs to the lesson.</h2>
        <p>Each PDF was converted into structured JSON page by page. Hyperlink rectangles are matched to the text beneath them, then rendered immediately beside the relevant instruction.</p>
      </div>
      <div class="method-steps">
        <div><Document :size="24" /><span>01</span><p>Canonical PDF</p></div>
        <div><Book :size="24" /><span>02</span><p>Structured text</p></div>
        <div><Play :size="24" /><span>03</span><p>Linked demos</p></div>
      </div>
    </section>
  </div>
</template>
