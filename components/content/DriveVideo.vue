<script setup lang="ts">
const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, default: 'Video' }
})

const playing = ref(false)
const src = computed(() => `https://drive.google.com/file/d/${props.id}/preview`)
</script>

<template>
  <figure class="drive-video">
    <div class="drive-video__frame">
      <iframe
        v-if="playing"
        :src="src"
        :title="title"
        frameborder="0"
        allow="autoplay; fullscreen"
        allowfullscreen
      />
      <button
        v-else
        type="button"
        class="drive-video__facade"
        :aria-label="`Play video: ${title}`"
        @click="playing = true"
      >
        <span class="drive-video__play" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        </span>
        <span class="drive-video__label">{{ title }}</span>
        <span class="drive-video__hint">Streams from Google Drive</span>
      </button>
    </div>
  </figure>
</template>

<style scoped>
.drive-video {
  margin: 1.5rem 0 2rem;
}

.drive-video__frame {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #161616;
  overflow: hidden;
}

.drive-video__frame iframe,
.drive-video__facade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.drive-video__facade {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border: 0;
  cursor: pointer;
  background: radial-gradient(ellipse at center, #262626 0%, #161616 75%);
  color: #f4f4f4;
}

.drive-video__play {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cds-button-primary, #0f62fe);
  color: #fff;
  border-radius: 50%;
  transition: background 0.15s ease;
}

.drive-video__facade:hover .drive-video__play {
  background: var(--cds-button-primary-hover, #0353e9);
}

.drive-video__play svg {
  margin-left: 3px;
}

.drive-video__label {
  font-size: 1.125rem;
  font-weight: 600;
}

.drive-video__hint {
  font-size: 0.75rem;
  color: #a8a8a8;
}
</style>
