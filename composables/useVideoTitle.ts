// Client-side, best-effort YouTube title lookup via noembed.com (CORS-friendly).
// Falls back silently — the embed works fine without a title.
const cache = new Map<string, Promise<string | null>>()

export function useVideoTitle(id: string) {
  const title = ref<string | null>(null)

  onMounted(() => {
    const stored = sessionStorage.getItem(`yt-title:${id}`)
    if (stored) {
      title.value = stored
      return
    }
    if (!cache.has(id)) {
      cache.set(
        id,
        fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => (data && typeof data.title === 'string' ? data.title : null))
          .catch(() => null)
      )
    }
    cache.get(id)!.then((t) => {
      if (t) {
        title.value = t
        try {
          sessionStorage.setItem(`yt-title:${id}`, t)
        } catch {
          /* storage full — ignore */
        }
      }
    })
  })

  return title
}
