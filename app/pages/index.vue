<script setup lang="ts">
import { ArrowRight20 as ArrowRight, CheckmarkFilled20 as Check, Time20 as Time } from '@carbon/icons-vue'
import { programs } from '~/data/library'

useSeoMeta({ title: '35-day boxing programs', description: 'Choose a program, open today, and train from a complete source-linked workout lesson.' })
const { completedFor, isComplete } = useTrainingProgress()
</script>

<template>
  <div class="course-overview">
    <section class="course-hero">
      <p class="course-kicker">KO BOXING PACKAGE · WORK THE PROGRAM</p>
      <h1>A training plan you can<br>actually use <em>today.</em></h1>
      <p class="course-intro">Choose your level, tap the day, and get the entire workout in one phone-ready lesson—with every demonstration attached to the exact drill it teaches.</p>
      <div class="course-facts"><span>2 programs</span><i>·</i><span>10 weeks</span><i>·</i><span>70 daily lessons</span></div>
      <NuxtLink class="course-start" :to="programs[0].weeks[0].lessons[0].href">Start the basic program <ArrowRight :size="16" /></NuxtLink>
    </section>

    <section class="course-map" aria-labelledby="course-map-title">
      <p class="section-label">YOUR TRAINING MAP</p>
      <h2 id="course-map-title">Two paths. Five weeks each.</h2>

      <article v-for="(program, programIndex) in programs" :key="program.id" class="program-section">
        <div class="program-index">0{{ programIndex + 1 }}</div>
        <div class="program-body">
          <div class="program-heading">
            <div><p>{{ program.eyebrow }}</p><h3>{{ program.title }}</h3><span>{{ program.description }}</span></div>
            <NuxtLink :to="`/program/${program.id}`">View program <ArrowRight :size="16" /></NuxtLink>
          </div>
          <div class="progress-line" role="progressbar" :aria-valuenow="completedFor(`${program.id}-day-`)" aria-valuemin="0" aria-valuemax="35">
            <span :style="{ width: `${completedFor(`${program.id}-day-`) / 35 * 100}%` }" />
          </div>
          <p class="progress-copy">{{ completedFor(`${program.id}-day-`) }} of 35 days complete</p>
          <ol class="week-list">
            <li v-for="week in program.weeks" :id="`${program.id}-week-${week.number}`" :key="week.number">
              <div class="week-heading"><span>Week {{ String(week.number).padStart(2, '0') }}</span><strong>{{ week.title }}</strong><p>{{ week.description }}</p></div>
              <div class="day-strip">
                <NuxtLink v-for="lesson in week.lessons" :key="lesson.id" :to="lesson.href" :class="{ complete: isComplete(lesson.id) }">
                  <Check v-if="isComplete(lesson.id)" :size="16" />
                  <span v-else>{{ lesson.dayOfWeek }}</span>
                  <strong>Day {{ lesson.day }}</strong>
                  <small>{{ lesson.dayOfWeek <= 5 ? 'Box' : lesson.dayOfWeek === 6 ? 'Build' : 'Rest' }}</small>
                </NuxtLink>
              </div>
            </li>
          </ol>
        </div>
      </article>
    </section>

    <section class="source-footer">
      <div><p class="section-label">SOURCE FIDELITY</p><h2>The coach’s material stays canonical.</h2></div>
      <p>The interface changes the order you access the program—not the prescribed work. Every daily lesson points back to its PDF page, preserves the extracted text, and keeps YouTube links attached to their source annotations.</p>
      <Time :size="32" />
    </section>
  </div>
</template>
