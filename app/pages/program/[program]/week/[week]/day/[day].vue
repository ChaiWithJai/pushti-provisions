<script setup lang="ts">
import { ArrowLeft20 as ArrowLeft, ArrowRight20 as ArrowRight, Checkmark20 as Check, Download16 as Download, Launch16 as Launch, PlayFilledAlt20 as Play } from '@carbon/icons-vue'
import { getTrainingLesson } from '~/data/library'

const route = useRoute()
const result = getTrainingLesson(String(route.params.program), Number(route.params.week), Number(route.params.day))
if (!result) throw createError({ statusCode: 404, statusMessage: 'Training day not found' })
const { program, week, lesson, page, overviewPage, previous, next } = result
const { isComplete, toggle } = useTrainingProgress()

const leadLink = page.links.find(link => link.video)
const remainingLinks = (links: typeof page.links) => links.filter(link => !leadLink?.video || link.video?.key !== leadLink.video.key || link.blockId !== leadLink.blockId)
const demonstrationCount = page.links.filter(link => link.video).length
const sourceUrl = `${program.pdfUrl}#page=${lesson.sourcePage}`
const overviewUrl = overviewPage ? `${program.pdfUrl}#page=${overviewPage.number}` : null
const prior = previous ? `Bring forward one technique cue from Day ${previous.day}.` : 'Start with a stance you can hold without tension and enough clear space to move safely.'
const dropoff = lesson.dayOfWeek === 7
  ? 'You have completed the recovery routine and made an honest readiness check for the next week.'
  : `You have completed every prescribed block and can name one cue that improved your ${week.title.toLowerCase()} work.`

useSeoMeta({ title: lesson.title, description: lesson.summary || lesson.objective })
</script>

<template>
  <article class="training-lesson">
    <nav class="crumbs" aria-label="Breadcrumb">
      <NuxtLink to="/">Programs</NuxtLink><span>/</span>
      <NuxtLink :to="`/program/${program.id}`">{{ program.title }}</NuxtLink><span>/</span>
      <NuxtLink :to="`/program/${program.id}#week-${week.number}`">Week {{ week.number }}</NuxtLink><span>/</span>
      <span>Day {{ lesson.day }}</span>
    </nav>

    <header class="lesson-header">
      <p class="lesson-meta">DAY {{ String(lesson.day).padStart(2, '0') }} · WEEK {{ String(week.number).padStart(2, '0') }} · {{ week.stage.toUpperCase() }}</p>
      <h1>{{ lesson.shortTitle }}</h1>
      <p class="lesson-deck">{{ lesson.objective }}</p>
      <div class="lesson-tags"><span>{{ lesson.role }}</span><span>{{ demonstrationCount }} demonstrations</span><span>Source page {{ lesson.sourcePage }}</span></div>
    </header>

    <aside class="safety-note" aria-label="Training safety">
      <strong>Train within your current ability.</strong>
      <p>Use appropriate space and equipment. Stop if you feel pain, dizziness, or signs of injury, and seek qualified medical or coaching guidance when needed.</p>
    </aside>

    <section v-if="leadLink" class="canonical-video" aria-labelledby="canonical-source-heading">
      <div class="canonical-heading"><div><p>CANONICAL SOURCE</p><h2 id="canonical-source-heading">Start with the coach’s demonstration.</h2></div><a :href="leadLink.url" target="_blank" rel="noopener">YouTube <Launch :size="16" /></a></div>
      <VideoEmbed :link="leadLink" />
      <nav class="visual-citations" aria-label="Source links">
        <a :href="sourceUrl" target="_blank"><span>Canonical PDF · page {{ lesson.sourcePage }}</span><Launch :size="16" /></a>
        <a :href="leadLink.url" target="_blank"><span>Lead demonstration · YouTube</span><Launch :size="16" /></a>
        <a :href="program.pdfUrl" download><span>Download full plan</span><Download :size="16" /></a>
      </nav>
    </section>

    <div class="lesson-columns">
      <main id="lesson-content" class="lesson-content">
        <section id="objective" class="lesson-section transformation-section">
          <div class="section-number">01</div>
          <p class="section-label">PICKUP → DROPOFF</p>
          <h2>Know what today is for before you start.</h2>
          <div class="transformation-grid">
            <article><p>PICKUP</p><h3>{{ prior }}</h3><dl><dt>Today’s focus</dt><dd>{{ week.title }}</dd><dt>Use the source</dt><dd>Watch each linked demonstration before attempting an unfamiliar drill.</dd></dl></article>
            <article><p>DROPOFF</p><h3>{{ dropoff }}</h3><dl><dt>Performance evidence</dt><dd>{{ lesson.assessment }}</dd><dt>Transfer</dt><dd>{{ lesson.transfer }}</dd></dl></article>
          </div>
        </section>

        <section v-if="overviewPage" id="week-brief" class="lesson-section week-brief-section">
          <div class="section-number">02</div>
          <p class="section-label">CANONICAL WEEK BRIEF</p>
          <h2>Use the week’s purpose and objectives to frame today’s work.</h2>
          <div class="source-integrity-note"><strong>Week {{ week.number }} source</strong><p>This briefing is preserved from {{ program.sourceTitle }} page {{ overviewPage.number }}.</p><a :href="overviewUrl || program.pdfUrl" target="_blank">Inspect week source <Launch :size="16" /></a></div>
          <div class="week-brief-copy">
            <template v-for="section in overviewPage.sections" :key="section.id">
              <div v-for="block in section.blocks" :key="block.id" :class="['source-block', `source-block--${block.type}`]">
                <h3 v-if="block.type === 'title' || block.type === 'heading'">{{ block.text }}</h3>
                <p v-else-if="block.type !== 'marker'">{{ block.text }}</p>
              </div>
            </template>
          </div>
        </section>

        <section id="workout" class="lesson-section workout-section">
          <div class="section-number">{{ overviewPage ? '03' : '02' }}</div>
          <p class="section-label">TODAY’S WORKOUT</p>
          <h2>Follow the source in order. Tap any demonstration when you reach its drill.</h2>
          <div class="source-integrity-note"><strong>Trainer-owned content</strong><p>The wording and sequence below come directly from {{ program.sourceTitle }}. Spelling and phrasing are preserved so the PDF remains authoritative.</p><a :href="sourceUrl" target="_blank">Inspect source <Launch :size="16" /></a></div>

          <ol class="workout-flow">
            <li v-for="(section, index) in page.sections" :id="section.id" :key="section.id" :class="['workout-block', `workout-block--${section.kind}`, { 'workout-block--linked': section.links.length }]">
              <span class="block-index">{{ String(index + 1).padStart(2, '0') }}</span>
              <div class="source-section">
                <p class="source-section-label">{{ section.kind === 'supplement' ? 'SUPPLEMENTAL WORK' : section.kind === 'checklist' ? 'DAILY CHECKLIST' : section.kind === 'recovery' ? 'RECOVERY' : 'SOURCE SECTION' }}</p>
                <div v-for="block in section.blocks" :id="block.id" :key="block.id" :class="['source-block', `source-block--${block.type}`]">
                  <span v-if="block.type === 'marker'" class="source-marker">{{ block.text }}</span>
                  <h3 v-else-if="block.type === 'title' || block.type === 'heading'">{{ block.text }}</h3>
                  <p v-else>{{ block.text }}</p>
                  <BlockResources :links="remainingLinks(block.links)" />
                  <div v-if="leadLink && block.links.some(link => link.video?.key === leadLink.video?.key)" class="lead-reference"><Play :size="16" /> Lead video shown above</div>
                </div>
              </div>
            </li>
          </ol>
        </section>

        <section id="finish" class="lesson-section finish-section">
          <div class="section-number">{{ overviewPage ? '04' : '03' }}</div>
          <p class="section-label">FINISH THE LOOP</p>
          <h2>Keep one useful cue, then mark the day complete.</h2>
          <p>{{ lesson.assessment }}</p>
          <button class="complete-button" :class="{ completed: isComplete(lesson.id) }" @click="toggle(lesson.id)">
            <Check :size="20" />{{ isComplete(lesson.id) ? 'Day complete — tap to undo' : 'Mark day complete' }}
          </button>
        </section>

        <nav class="next-day" aria-label="Training days">
          <NuxtLink v-if="previous" :to="previous.href"><span><ArrowLeft :size="16" /> Previous day</span><strong>{{ previous.shortTitle }}</strong></NuxtLink><span v-else />
          <NuxtLink v-if="next" :to="next.href" class="next-link"><span>Up next <ArrowRight :size="16" /></span><strong>Day {{ next.day }} · {{ next.shortTitle }}</strong></NuxtLink>
          <NuxtLink v-else :to="`/program/${program.id}`" class="next-link"><span>Program complete <ArrowRight :size="16" /></span><strong>Review your five weeks</strong></NuxtLink>
        </nav>
      </main>

      <aside class="lesson-outline">
        <nav aria-label="On this lesson">
          <h2>On this lesson</h2>
          <a href="#objective">Pickup → Dropoff</a>
          <a v-if="overviewPage" href="#week-brief">Week brief</a>
          <a href="#workout">Today’s workout</a>
          <a href="#finish">Finish the loop</a>
        </nav>
      </aside>
    </div>
  </article>
</template>
