<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { afterScrollIdle } from '@/motion/scrollIdle'

const props = defineProps<{ value: number }>()

const DURATION = 900

// Na starcie zawsze prawdziwa liczba: bez animacji (testy, ograniczony ruch) nic się nie zmienia
const shown = ref(props.value)
const el = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null
let frame = 0
let counting = false
let cancelIdle: (() => void) | null = null

function countUp() {
  counting = true
  const start = performance.now()
  const step = (now: number) => {
    const progress = Math.min(1, (now - start) / DURATION)
    // Szybki start i miękkie hamowanie przy docelowej liczbie
    const eased = 1 - Math.pow(1 - progress, 3)
    shown.value = Math.round(props.value * eased)
    if (progress < 1) frame = requestAnimationFrame(step)
    else counting = false
  }
  frame = requestAnimationFrame(step)
}

onMounted(() => {
  const motionAllowed =
    typeof IntersectionObserver !== 'undefined' &&
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!motionAllowed || !el.value || props.value === 0) return

  // Licznik dolicza od zera tylko raz, gdy pierwszy raz pojawi się na ekranie.
  // Zmiana liczby w tekście przelicza układ, więc czeka na koniec przewijania.
  shown.value = 0
  observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    observer?.disconnect()
    observer = null
    counting = true
    cancelIdle = afterScrollIdle(countUp)
  })
  observer.observe(el.value)
})

// Po polubieniu liczba zmienia się od razu, bez ponownego doliczania
watch(
  () => props.value,
  (value) => {
    if (observer || counting) return
    shown.value = value
  },
)

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelIdle?.()
  cancelAnimationFrame(frame)
})
</script>

<template>
  <!-- Czytnik ekranu dostaje od razu prawdziwą liczbę, a nie wartości w trakcie doliczania -->
  <span ref="el" class="count-up">
    <span aria-hidden="true">{{ shown }}</span>
    <span class="visually-hidden">{{ value }}</span>
  </span>
</template>

<style scoped>
.count-up {
  font-variant-numeric: tabular-nums;
}
</style>
