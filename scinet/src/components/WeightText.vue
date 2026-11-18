<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'

const props = withDefaults(
  defineProps<{
    text: string
    /** Tekst dla czytników ekranu. Bez niego napis jest tylko ozdobą. */
    label?: string
    /** Grubość w spoczynku i najbliżej kursora (oś `wght` fontu Archivo) */
    min?: number
    max?: number
  }>(),
  { label: '', min: 300, max: 900 },
)

// Zasięg działania kursora w wielokrotnościach wysokości fontu
const RADIUS = 1.6
// Jak szybko grubość dąży do celu w każdej klatce (0–1)
const EASE = 0.18
const SWEEP_MS = 1400

const chars = computed(() => [...props.text])
const root = ref<HTMLElement | null>(null)
// Szerokość każdej litery przy maksymalnej grubości, w em. Litery nie przesuwają się
// przy zmianie grubości, więc efekt nie powoduje przesunięć układu (CLS).
const widths = ref<number[]>([])

const reducedMotion = useReducedMotion()

let spans: HTMLElement[] = []
let current: number[] = []
let target: number[] = []
let frame = 0
let inView = false
let sweepStart = 0
let swept = false
let observer: IntersectionObserver | null = null

function measure() {
  const el = root.value
  if (!el) return
  spans = [...el.querySelectorAll<HTMLElement>('.wt-char')]
  const fontSize = parseFloat(getComputedStyle(el).fontSize) || 16
  for (const span of spans) span.style.fontWeight = String(props.max)
  widths.value = spans.map((span) => span.getBoundingClientRect().width / fontSize)
  for (const span of spans) span.style.fontWeight = ''
  current = spans.map(() => props.min)
  target = [...current]
}

// Grubość litery zależy od odległości jej środka od punktu (kursora albo fali)
function aim(x: number, y: number) {
  const el = root.value
  if (!el) return
  const radius = (parseFloat(getComputedStyle(el).fontSize) || 16) * RADIUS
  target = spans.map((span) => {
    const box = span.getBoundingClientRect()
    const distance = Math.hypot(box.left + box.width / 2 - x, box.top + box.height / 2 - y)
    const strength = Math.max(0, 1 - distance / radius)
    return props.min + (props.max - props.min) * strength * strength * (3 - 2 * strength)
  })
  schedule()
}

function rest() {
  target = spans.map(() => props.min)
  schedule()
}

function tick(now: number) {
  frame = 0
  // Fala przy pierwszym pojawieniu się napisu: na dotyku jedyny efekt, na komputerze zapowiedź
  if (sweepStart) {
    const progress = (now - sweepStart) / SWEEP_MS
    const box = root.value?.getBoundingClientRect()
    if (progress >= 1 || !box) {
      sweepStart = 0
      rest()
    } else {
      aim(box.left - box.width * 0.2 + box.width * 1.4 * progress, box.top + box.height / 2)
    }
  }

  let moving = false
  spans.forEach((span, i) => {
    const goal = target[i] ?? props.min
    const value = current[i] ?? props.min
    const next = Math.abs(goal - value) < 1 ? goal : value + (goal - value) * EASE
    if (next !== goal) moving = true
    if (Math.round(next) !== Math.round(value)) span.style.fontWeight = String(Math.round(next))
    current[i] = next
  })
  if (moving || sweepStart) schedule()
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(tick)
}

function onPointerMove(event: PointerEvent) {
  if (inView && event.pointerType === 'mouse') aim(event.clientX, event.clientY)
}

onMounted(async () => {
  await document.fonts?.ready
  if (!root.value) return
  measure()
  if (reducedMotion.value || typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(([entry]) => {
    inView = Boolean(entry?.isIntersecting)
    if (inView && !swept) {
      swept = true
      sweepStart = performance.now()
      schedule()
    }
    if (!inView) rest()
  })
  observer.observe(root.value)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', rest)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('pointermove', onPointerMove)
  document.documentElement.removeEventListener('pointerleave', rest)
  cancelAnimationFrame(frame)
})
</script>

<template>
  <span ref="root" class="weight-text" :style="{ '--wt-min': min }">
    <span v-if="label" class="visually-hidden">{{ label }}</span>
    <span class="wt-chars" aria-hidden="true">
      <span
        v-for="(char, i) in chars"
        :key="i"
        class="wt-char"
        :style="widths[i] ? { width: `${widths[i]}em` } : undefined"
        >{{ char === ' ' ? ' ' : char }}</span
      >
    </span>
  </span>
</template>

<style scoped>
.weight-text {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: var(--wt-min);
  white-space: nowrap;
}

.wt-char {
  display: inline-block;
  text-align: center;
}
</style>
