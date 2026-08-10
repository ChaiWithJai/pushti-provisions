<script setup lang="ts">
import { ArrowRight20 as ArrowRight, CheckmarkFilled16 as Check, Download16 as Download } from '@carbon/icons-vue'
import { getProgram } from '~/data/library'

const route = useRoute()
const program = getProgram(String(route.params.program))
if (!program) throw createError({ statusCode: 404, statusMessage: 'Program not found' })
const { completedFor, isComplete } = useTrainingProgress()
useSeoMeta({ title: program.title, description: program.description })
</script>

<template>
  <div class="program-page">
    <header class="program-hero">
      <div class="crumbs"><NuxtLink to="/">Programs</NuxtLink><span>/</span><span>{{ program.title }}</span></div>
      <p class="course-kicker">{{ program.eyebrow }}</p>
      <h1>{{ program.title }}</h1>
      <p>{{ program.description }}</p>
      <div class="program-actions">
        <NuxtLink class="primary-action" :to="program.weeks[0].lessons[0].href">Open day 1 <ArrowRight :size="16" /></NuxtLink>
        <a class="text-action" :href="program.pdfUrl" download><Download :size="16" /> Download source PDF</a>
      </div>
      <div class="progress-line"><span :style="{ width: `${completedFor(`${program.id}-day-`) / 35 * 100}%` }" /></div>
      <small>{{ completedFor(`${program.id}-day-`) }} / 35 days complete on this device</small>
    </header>

    <main class="program-syllabus">
      <section v-for="week in program.weeks" :id="`week-${week.number}`" :key="week.number" class="syllabus-week">
        <div class="syllabus-label">Week {{ String(week.number).padStart(2, '0') }}</div>
        <div>
          <p class="stage-label">{{ week.stage }}</p>
          <h2>{{ week.title }}</h2>
          <p class="week-description">{{ week.description }}</p>
          <ol class="lesson-list">
            <li v-for="lesson in week.lessons" :key="lesson.id">
              <button class="complete-dot" :aria-label="isComplete(lesson.id) ? `Completed: ${lesson.title}` : `Not completed: ${lesson.title}`"><Check v-if="isComplete(lesson.id)" :size="16" /><span v-else>{{ lesson.day }}</span></button>
              <NuxtLink :to="lesson.href">
                <span class="lesson-role">{{ lesson.role }} · Day {{ lesson.day }}</span>
                <strong>{{ lesson.shortTitle }}</strong>
                <p>{{ lesson.summary }}</p>
                <small>{{ lesson.videoCount }} demonstrations</small>
              </NuxtLink>
            </li>
          </ol>
        </div>
      </section>
    </main>
  </div>
</template>
