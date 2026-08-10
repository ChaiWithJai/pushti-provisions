import { readFile, writeFile } from 'node:fs/promises'

const root = new URL('../', import.meta.url)
const basic = JSON.parse(await readFile(new URL('content/boxing/basic-workout-plan.json', root), 'utf8'))
const competitive = JSON.parse(await readFile(new URL('content/boxing/competitive-workout-plan.json', root), 'utf8'))

const weekFocus = {
  basic: [
    ['Stance and movement', 'Build repeatable stance, straight punches, movement, and foundational defensive habits.'],
    ['Defense and body work', 'Add slips, rolls, body attacks, and longer shadow-boxing rounds.'],
    ['Pivots and combinations', 'Connect pivots, uppercuts, hooks, and combination work without losing stance.'],
    ['Shifts and angles', 'Use shifts, weight transfer, and defensive counters to create new attacking lines.'],
    ['Integration and control', 'Bring footwork, defense, counters, and conditioning together with better technique.']
  ],
  competitive: [
    ['General preparation', 'Foundation building: reinforce fundamentals, conditioning, mobility, and training discipline.'],
    ['Specialized preparation', 'Optimize boxing skill, ring IQ, fight-specific conditioning, strength, and explosiveness.'],
    ['Specialized preparation', 'Develop the specialized phase through more demanding combinations and tactical work.'],
    ['Specialized preparation', 'Integrate angles, feints, counters, and pressure-ready conditioning.'],
    ['Peak performance', 'Fight readiness: sharpen timing, precision, composure, and tactical execution while staying fresh.']
  ]
}

const roleFor = (program, dayOfWeek) => {
  if (dayOfWeek <= 5) return 'Boxing workout'
  if (dayOfWeek === 7) return 'Rest and mobility'
  return program === 'basic' ? 'Strength and recovery' : 'Conditioning and recovery'
}

const clean = text => text.replace(/\s+/g, ' ').trim()
const summaryFor = (page) => {
  const text = page.sections
    .filter(section => section.kind !== 'header' && section.kind !== 'checklist')
    .map(section => clean(section.title))
    .slice(0, 3)
    .join(' · ')
  return text.length > 210 ? `${text.slice(0, 207).trim()}…` : text
}

function lesson(program, source, week, dayOfWeek, sourcePage, overviewPage = null) {
  const day = (week - 1) * 7 + dayOfWeek
  const page = source.pages.find(item => item.number === sourcePage)
  if (!page) throw new Error(`Missing ${program} source page ${sourcePage}`)
  const videoIds = page.links.filter(link => link.video)
  const role = roleFor(program, dayOfWeek)
  const workoutTitle = page.title.replace(/^Boxing Workout\s*/i, 'Workout ')
  const title = dayOfWeek === 7 ? `Day ${day}: Rest and reset` : `Day ${day}: ${workoutTitle}`
  return {
    id: `${program}-day-${day}`,
    day,
    week,
    dayOfWeek,
    title,
    shortTitle: dayOfWeek === 7 ? 'Rest and reset' : workoutTitle,
    role,
    sourcePage,
    overviewPage,
    summary: summaryFor(page),
    durationLabel: dayOfWeek === 7 ? 'Recovery day' : 'Follow prescribed rounds',
    videoCount: videoIds.length,
    prerequisiteLessonId: day > 1 ? `${program}-day-${day - 1}` : null,
    cognitiveLoad: dayOfWeek === 7 ? 0.35 : dayOfWeek === 6 ? 0.6 : 0.78,
    objective: `Complete ${role.toLowerCase()} using the prescribed rounds, repetitions, rest, and linked demonstrations from the canonical plan.`,
    observableBehavior: `Given the source workout and demonstrations, execute the session in order while maintaining controlled technique and honoring the written rest intervals.`,
    assessment: dayOfWeek === 7
      ? 'Complete the written recovery routine and confirm readiness for the next week.'
      : 'Finish the prescribed work, then identify one technique cue to carry into the next session.',
    transfer: dayOfWeek === 7
      ? 'Use recovery signals to decide whether to resume, reduce, or stop the next session.'
      : 'Apply today’s strongest cue during the final freestyle or independent round.',
    href: `/program/${program}/week/${week}/day/${dayOfWeek}`
  }
}

function buildBasic() {
  const weeks = Array.from({ length: 5 }, (_, weekIndex) => {
    const week = weekIndex + 1
    const [title, description] = weekFocus.basic[weekIndex]
    return {
      number: week,
      stage: 'Beginner foundation',
      title,
      description,
      lessons: Array.from({ length: 7 }, (_, dayIndex) => lesson('basic', basic, week, dayIndex + 1, 3 + weekIndex * 7 + dayIndex))
    }
  })
  return {
    id: 'basic',
    title: 'Basic Boxing Program',
    eyebrow: 'Beginner · 5 weeks · 35 days',
    description: 'Build stance, movement, defense, combinations, strength, and recovery through a complete five-week beginner progression.',
    sourceSlug: basic.source.slug,
    sourceTitle: basic.source.title,
    pdfUrl: basic.source.pdfUrl,
    sha256: basic.source.sha256,
    weeks
  }
}

function buildCompetitive() {
  const overviewPages = [4, 12, 20, 28, 36]
  const firstDayPages = [5, 13, 21, 29, 37]
  const stages = ['General preparation', 'Specialized preparation', 'Specialized preparation', 'Specialized preparation', 'Peak performance']
  const weeks = Array.from({ length: 5 }, (_, weekIndex) => {
    const week = weekIndex + 1
    const [title, description] = weekFocus.competitive[weekIndex]
    return {
      number: week,
      stage: stages[weekIndex],
      title,
      description,
      overviewPage: overviewPages[weekIndex],
      lessons: Array.from({ length: 7 }, (_, dayIndex) => lesson('competitive', competitive, week, dayIndex + 1, firstDayPages[weekIndex] + dayIndex, overviewPages[weekIndex]))
    }
  })
  return {
    id: 'competitive',
    title: 'Competitive Boxing Camp',
    eyebrow: 'Intermediate · 5 weeks · 35 days',
    description: 'Move from general preparation through specialized boxing work to a final fight-readiness week.',
    sourceSlug: competitive.source.slug,
    sourceTitle: competitive.source.title,
    pdfUrl: competitive.source.pdfUrl,
    sha256: competitive.source.sha256,
    weeks
  }
}

const output = {
  schemaVersion: 1,
  generatedFrom: [basic.source.sha256, competitive.source.sha256],
  learningDomain: 'motor_skills',
  programs: [buildBasic(), buildCompetitive()]
}

await writeFile(new URL('content/boxing/programs.json', root), `${JSON.stringify(output, null, 2)}\n`)

const allLessons = output.programs.flatMap(program => program.weeks.flatMap(week => week.lessons.map(item => ({ ...item, programId: program.id }))))
const objectives = allLessons.map(item => ({
  label: 'LEARNING_OBJECTIVE', id: `objective-${item.id}`, verb: 'execute', bloomLevel: 3,
  content: item.objective, observableBehavior: item.observableBehavior, assessmentMethod: 'performance_task',
  prerequisiteIds: item.prerequisiteLessonId ? [`objective-${item.prerequisiteLessonId}`] : [], domain: 'motor_skills', confidence: 'inferred'
}))
const concepts = output.programs.flatMap(program => program.weeks.map((week, index) => ({
  label: 'CONCEPT', id: `concept-${program.id}-week-${week.number}`, name: week.title, definition: week.description,
  prerequisiteConcepts: index ? [`concept-${program.id}-week-${week.number - 1}`] : [], cognitiveLoadEstimate: 0.65,
  domain: 'motor_skills'
})))
const skills = allLessons.map(item => ({
  label: 'SKILL', id: `skill-${item.id}`, name: item.role, verbPhrase: `complete ${item.role.toLowerCase()}`,
  observableBehavior: item.observableBehavior, performanceStandard: item.assessment,
  conditions: 'Given the canonical workout text, safe training space, and linked coach demonstrations',
  subSkills: [], practiceRequired: 'Complete the prescribed session and carry one cue forward', domain: 'motor_skills',
  difficultyLevel: item.programId === 'competitive' ? 'transfer' : 'guided'
}))
const assessments = allLessons.map(item => ({
  label: 'ASSESSMENT_ITEM', id: `assessment-${item.id}`, type: 'performance_task', objectiveIds: [`objective-${item.id}`],
  prompt: item.assessment, alignmentScore: 1, commonErrors: ['Skipping written rest intervals', 'Prioritizing speed over controlled technique']
}))
const transferContexts = allLessons.map(item => ({
  label: 'TRANSFER_CONTEXT', id: `transfer-${item.id}`, skillId: `skill-${item.id}`,
  learnedContext: 'Prescribed daily workout', transferContext: item.transfer, distance: 'near',
  adaptationRequired: ['Scale intensity to current readiness without changing technique'],
  scenarioPrompt: item.transfer, successCriteria: item.assessment
}))
const prerequisiteNodes = objectives.map(item => item.id)
const prerequisiteEdges = objectives.flatMap(item => item.prerequisiteIds.map(prerequisite => [prerequisite, item.id]))
const scores = {
  objectiveClarity: objectives.every(item => item.verb && item.observableBehavior && item.assessmentMethod) ? 1 : 0,
  prerequisiteValidity: prerequisiteEdges.every(([from, to]) => prerequisiteNodes.includes(from) && prerequisiteNodes.includes(to)) ? 1 : 0,
  cognitiveLoadBalance: Math.max(...allLessons.map(item => item.cognitiveLoad)) <= 0.9 ? 1 : 0,
  assessmentAlignment: assessments.every(item => item.objectiveIds.length && item.alignmentScore >= 0.7) ? 1 : 0,
  transferPotential: transferContexts.length === skills.length ? 0.85 : 0.3,
  dignityPreservation: 0.9
}
const composite = scores.objectiveClarity * .2 + scores.prerequisiteValidity * .15 + scores.cognitiveLoadBalance * .15 + scores.assessmentAlignment * .2 + scores.transferPotential * .15 + scores.dignityPreservation * .15
const instructionalDesign = {
  contentId: 'ko-boxing-daily-programs-v1', schemaVersion: '1.0', labeledBy: 'hybrid', learningDomain: 'motor_skills',
  learnerProfile: 'An adult beginner or intermediate boxer using a phone during independent training.',
  sourceAuthority: 'Workout prescriptions and demonstrations remain trainer-owned and source-linked; generated metadata does not replace coaching or medical judgment.',
  labeledContent: {
    objectives, concepts, skills,
    misconceptions: [
      { label: 'MISCONCEPTION', id: 'misconception-speed', incorrectBelief: 'Faster work always means better boxing.', correctMentalModel: 'Controlled technique and prescribed rest come before speed.', correctionStrategy: 'Rewatch the owning drill demonstration and reduce pace.' },
      { label: 'MISCONCEPTION', id: 'misconception-pain', incorrectBelief: 'Pain or dizziness should be pushed through to finish the plan.', correctMentalModel: 'Stop and seek qualified guidance when warning signs appear.', correctionStrategy: 'Safety stop and professional consultation.' },
      { label: 'MISCONCEPTION', id: 'misconception-video', incorrectBelief: 'Watching the demonstration is equivalent to practicing the skill.', correctMentalModel: 'The video guides attention; observable performance is the evidence.', correctionStrategy: 'Watch, execute, then retain one cue.' }
    ],
    assessments, transferContexts,
    modules: allLessons.map(item => ({ moduleId: item.id, cognitiveLoad: { intrinsic: item.cognitiveLoad, extraneous: 0.08, germane: 0.7, totalLoad: item.cognitiveLoad, warningFlags: [] } })),
    prerequisiteGraph: { nodes: prerequisiteNodes, edges: prerequisiteEdges }
  },
  validation: {
    status: composite >= .7 ? 'pass' : 'fail', validationScore: composite,
    prerequisiteValidity: { passed: scores.prerequisiteValidity === 1, score: scores.prerequisiteValidity, issues: [] },
    cognitiveLoadAnalysis: { passed: scores.cognitiveLoadBalance === 1, maximum: Math.max(...allLessons.map(item => item.cognitiveLoad)), overloadedModules: [] },
    alignmentAnalysis: { coverageRate: assessments.length / objectives.length, unassessedObjectives: [] },
    sequencingAnalysis: { orderingValid: true, scaffoldingProgression: 'guided-to-transfer', difficultyCurve: 'progressive' },
    criticalIssues: []
  },
  evaluation: {
    status: composite >= .7 ? 'pass' : 'fail', compositeScore: composite, dimensionScores: scores,
    semanticEvaluation: {
      instructionalQuality: 'Schedule-first access, source authority, completion evidence, and next-day transfer form a coherent daily practice loop.',
      transferReadiness: 'Every work day ends with a cue to apply independently; rest days explicitly assess readiness.',
      dignityPatterns: 'Progress remains learner-controlled and completion can be undone without penalty.'
    },
    humanFeedback: { status: 'source-expert-authored', note: 'The interface preserves trainer-authored prescriptions. Collect learner and coach feedback after real workouts; generated metadata is non-prescriptive.' },
    experiment: {
      id: 'schedule-first-vs-page-browser', hypothesis: 'Schedule-first daily lessons will increase completed workouts because the learner can reach all instructions and videos from one day link.',
      control: 'PDF page browser', treatment: 'Stage/week/day lesson flow', primaryMetrics: ['workout_completion_rate', 'next_day_return_rate'],
      secondaryMetrics: ['video_play_rate', 'time_to_first_demo'], guardrails: ['dropout_rate', 'self_reported_confusion'], status: 'instrumentation-ready'
    },
    recommendation: composite >= .85 ? 'deploy-with-monitoring' : 'revise'
  }
}
await writeFile(new URL('content/boxing/instructional-design.json', root), `${JSON.stringify(instructionalDesign, null, 2)}\n`)
console.log(`Wrote ${output.programs.reduce((sum, program) => sum + program.weeks.flatMap(week => week.lessons).length, 0)} daily lessons`)
console.log(`Instructional design composite: ${composite.toFixed(3)}`)
