<script setup lang="ts">
import { CheckmarkFilled16 as Check, Close20 as Close } from '@carbon/icons-vue'
import { programs } from '~/data/library'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()
const route = useRoute()
const { isComplete } = useTrainingProgress()
const expanded = ref<Record<string, boolean>>({
  basic: !route.path.includes('/competitive'),
  competitive: route.path.includes('/competitive')
})
</script>

<template>
  <aside class="side-nav" :class="{ 'side-nav--open': open }" aria-label="Training course">
    <div class="side-nav-mobile-head">
      <span>Course</span>
      <button class="icon-button" aria-label="Close navigation" @click="$emit('close')"><Close :size="20" /></button>
    </div>
    <NuxtLink class="course-brand" to="/">
      <span class="course-mark">KO</span>
      <span><strong>Boxing Training</strong><small>WORK THE PROGRAM</small></span>
    </NuxtLink>
    <nav class="course-nav">
      <section v-for="(program, programIndex) in programs" :key="program.id" class="course-program">
        <button class="program-toggle" :aria-expanded="expanded[program.id]" @click="expanded[program.id] = !expanded[program.id]">
          <span>0{{ programIndex + 1 }}</span>{{ program.id === 'basic' ? 'Basic program' : 'Competitive camp' }}
        </button>
        <div v-if="expanded[program.id]" class="program-weeks">
          <div v-for="week in program.weeks" :key="week.number" class="nav-week">
            <NuxtLink :to="`/program/${program.id}#week-${week.number}`" class="week-label">Week {{ week.number }} · {{ week.title }}</NuxtLink>
            <ul>
              <li v-for="lesson in week.lessons" :key="lesson.id">
                <NuxtLink :to="lesson.href" :aria-current="route.path === lesson.href ? 'page' : undefined">
                  <Check v-if="isComplete(lesson.id)" :size="14" class="nav-check" />
                  <span v-else class="nav-day-number">{{ String(lesson.day).padStart(2, '0') }}</span>
                  <span>Day {{ lesson.day }}<small>{{ lesson.role }}</small></span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </nav>
    <div class="side-nav-foot">
      <span class="status-dot" />
      Canonical PDF training
    </div>
  </aside>
</template>
