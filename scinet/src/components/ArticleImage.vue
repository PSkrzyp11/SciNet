<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { canDistort, isCorsFriendly } from '@/fx/interaction'

// Efekt WebGL ładuje się dopiero przy pierwszym najechaniu myszą na obraz
type Distortion = typeof import('@/fx/imageDistortion')
let distortion: Distortion | null = null

const props = defineProps<{
  src?: string
  alt: string
  /** Obraz widoczny od razu (np. na stronie artykułu): bez leniwego ładowania */
  eager?: boolean
}>()

const failed = ref(false)
const loaded = ref(false)
// Gdy obraz z CORS jednak się nie wczyta, próbujemy jeszcze raz jako zwykły obraz
const corsBlocked = ref(false)

const frame = ref<HTMLElement | null>(null)
const image = ref<HTMLImageElement | null>(null)

// Tylko obraz pobrany z CORS może trafić do WebGL. Inne adresy dostają efekt CSS.
const useCors = computed(
  () => Boolean(props.src) && !corsBlocked.value && isCorsFriendly(props.src!),
)

// Nowy adres (np. po edycji artykułu) dostaje kolejną szansę
watch(
  () => props.src,
  () => {
    failed.value = false
    loaded.value = false
    corsBlocked.value = false
  },
)

function onError() {
  if (useCors.value) corsBlocked.value = true
  else failed.value = true
}

async function onEnter(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || !useCors.value || !canDistort()) return
  try {
    distortion ??= await import('@/fx/imageDistortion')
  } catch {
    return
  }
  // Kursor mógł zjechać z obrazu, zanim moduł się wczytał
  if (!frame.value || !image.value || !frame.value.matches(':hover')) return
  if (await distortion.activate(frame.value, image.value)) distortion.move(frame.value, event)
}

function onMove(event: PointerEvent) {
  if (frame.value) distortion?.move(frame.value, event)
}

function onLeave() {
  if (frame.value) distortion?.deactivate(frame.value)
}
</script>

<template>
  <!-- Bez adresu albo przy błędzie nie zostaje żadna pusta ramka -->
  <div
    v-if="src && !failed"
    ref="frame"
    class="article-image-frame"
    @pointerenter="onEnter"
    @pointermove="onMove"
    @pointerleave="onLeave"
  >
    <img
      ref="image"
      class="article-image"
      :class="{ loaded }"
      :src="src"
      :alt="alt"
      :crossorigin="useCors ? 'anonymous' : undefined"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : undefined"
      referrerpolicy="no-referrer"
      @load="loaded = true"
      @error="onError"
    />
  </div>
</template>

<style scoped>
.article-image-frame {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
}

.article-image {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: inherit;
  border: 1px solid var(--color-border-subtle);
  background: linear-gradient(
    90deg,
    var(--color-bg-subtle) 20%,
    var(--color-primary-light) 50%,
    var(--color-bg-subtle) 80%
  );
  background-size: 200% 100%;
  animation: image-shimmer var(--duration-shimmer) var(--ease-in-out) infinite;
  transition:
    transform var(--duration-slow) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}

.article-image.loaded {
  animation: none;
  background: var(--color-bg-subtle);
}

/* Plan B bez WebGL: obraz pod kursorem lekko się przybliża. Przy efekcie WebGL
   powiększenie robi shader, więc CSS go nie dubluje. */
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
  .article-image-frame:hover .article-image {
    transform: scale(1.04);
  }

  .article-image-frame.fx-on .article-image {
    transform: none;
  }
}

/* Wspólny canvas efektu WebGL, dokładany do ramki obrazu pod kursorem */
.article-image-frame :deep(.distortion-canvas) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.article-image-frame :deep(.distortion-canvas.visible) {
  opacity: 1;
}

@keyframes image-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-image {
    animation: none;
  }
}
</style>
