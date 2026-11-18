<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { afterScrollIdle, scrolledRecently } from '@/motion/scrollIdle'

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
// Środki liter na ekranie. Odczyt pozycji po zmianie grubości wymusza przeliczenie układu,
// więc robimy go raz na ruch kursora albo raz na start fali, a nie w każdej klatce.
let centers: { x: number; y: number }[] = []
let cancelSweep: (() => void) | null = null

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

function readCenters() {
  centers = spans.map((span) => {
    const box = span.getBoundingClientRect()
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
  })
}

// Grubość litery zależy od odległości jej środka od punktu (kursora albo fali)
function aim(x: number, y: number) {
  const el = root.value
  if (!el) return
  const radius = (parseFloat(getComputedStyle(el).fontSize) || 16) * RADIUS
  target = centers.map((center) => {
    const distance = Math.hypot(center.x - x, center.y - y)
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
    const first = centers[0]
    const last = centers[centers.length - 1]
    if (progress >= 1 || !first || !last) {
      sweepStart = 0
      rest()
    } else {
      // Punkt fali przesuwa się od lewej do prawej, trochę poza skrajne litery
      const span = last.x - first.x
      aim(first.x - span * 0.2 + span * 1.4 * progress, first.y)
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
  if (!inView || event.pointerType !== 'mouse') return
  // Przewijanie pod nieruchomym kursorem też wysyła pointermove. Litery czekają wtedy
  // na koniec przewijania, bo każda zmiana grubości przelicza ich układ.
  if (scrolledRecently()) return
  readCenters()
  aim(event.clientX, event.clientY)
}

// Fala nie gra w trakcie przewijania: zmiana grubości liter przelicza ich układ,
// więc czekamy, aż strona się zatrzyma. Wtedy też widać ją najlepiej.
function queueSweep() {
  cancelSweep?.()
  cancelSweep = afterScrollIdle(() => {
    cancelSweep = null
    if (!inView || swept) return
    swept = true
    readCenters()
    sweepStart = performance.now()
    schedule()
  })
}

onMounted(async () => {
  await document.fonts?.ready
  if (!root.value) return
  measure()
  if (reducedMotion.value || typeof IntersectionObserver === 'undefined') return

  observer = new IntersectionObserver(([entry]) => {
    inView = Boolean(entry?.isIntersecting)
    if (inView && !swept) queueSweep()
    if (!inView) rest()
  })
  observer.observe(root.value)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', rest)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  window.removeEventListener('pointermove', onPointerMove)
  cancelSweep?.()
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
