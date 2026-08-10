<script setup lang="ts">
const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  short: { type: Boolean, default: false }
})

const playing = ref(false)
const fetched = useVideoTitle(props.id)
const label = computed(() => props.title || fetched.value || '')

const thumb = computed(() => `https://i.ytimg.com/vi/${props.id}/hqdefault.jpg`)
const src = computed(
  () =>
    `https://www.youtube-nocookie.com/embed/${props.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
)
const watchUrl = computed(() =>
  props.short
    ? `https://www.youtube.com/shorts/${props.id}`
    : `https://www.youtube.com/watch?v=${props.id}`
)
</script>

<template>
  <figure class="video-embed" :class="{ 'video-embed--short': short }">
    <div class="video-embed__frame">
      <iframe
        v-if="playing"
        :src="src"
        :title="label || 'YouTube video'"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      />
      <button
        v-else
        type="button"
        class="video-embed__facade"
        :aria-label="`Play video${label ? ': ' + label : ''}`"
        @click="playing = true"
      >
        <img :src="thumb" :alt="label || 'Video thumbnail'" loading="lazy" />
        <span class="video-embed__play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </span>
        <span v-if="short" class="video-embed__badge">Short</span>
      </button>
    </div>
    <figcaption v-if="label" class="video-embed__caption">{{ label }}</figcaption>
  </figure>
</template>

<style scoped>
.video-embed {
  margin: 1.5rem 0 2rem;
}

.video-embed__frame {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
  overflow: hidden;
}

.video-embed--short {
  max-width: 20rem;
}

.video-embed--short .video-embed__frame {
  aspect-ratio: 9 / 16;
}

.video-embed__frame iframe,
.video-embed__facade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.video-embed__facade {
  display: block;
  border: 0;
  padding: 0;
  cursor: pointer;
  background: #000;
}

.video-embed__facade img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.85;
  transition: opacity 0.15s ease, transform 0.25s ease;
}

.video-embed__facade:hover img {
  opacity: 1;
  transform: scale(1.02);
}

.video-embed__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cds-button-primary, #0f62fe);
  color: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  transition: background 0.15s ease;
}

.video-embed__facade:hover .video-embed__play {
  background: var(--cds-button-primary-hover, #0353e9);
}

.video-embed__play svg {
  margin-left: 3px;
}

.video-embed__badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.32px;
  text-transform: uppercase;
  color: #161616;
  background: #f4f4f4;
  padding: 0.125rem 0.5rem;
}

.video-embed__caption {
  font-size: 0.8125rem;
  color: var(--cds-text-secondary, #525252);
  padding: 0.5rem 0 0;
  line-height: 1.4;
}
</style>
