const STORAGE_KEY = 'ko-boxing-training-progress-v1'

export function useTrainingProgress() {
  const completed = useState<string[]>('training-progress', () => [])
  const hydrated = useState('training-progress-hydrated', () => false)

  onMounted(() => {
    if (!hydrated.value) {
      try {
        completed.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      } catch {
        completed.value = []
      }
      hydrated.value = true
    }
  })

  const isComplete = (id: string) => completed.value.includes(id)
  const toggle = (id: string) => {
    completed.value = isComplete(id)
      ? completed.value.filter(item => item !== id)
      : [...completed.value, id]
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, JSON.stringify(completed.value))
  }
  const completedFor = (prefix: string) => completed.value.filter(id => id.startsWith(prefix)).length

  return { completed, isComplete, toggle, completedFor }
}
