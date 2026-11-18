<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

// Plan B: jedna flaga wyłącza towarzysza, a stany :hover elementów działają dalej
const ENABLED = true
// Jak szybko pierścień dogania kursor w każdej klatce (0–1)
const RING_EASE = 0.2

type CursorState = 'default' | 'link' | 'read' | 'text'

// Elementy, nad którymi pierścień się powiększa
const INTERACTIVE = 'a, button, [role="button"], [role="switch"], label, select, summary'
const TEXT_FIELDS = 'input:not([type="checkbox"]):not([type="radio"]), textarea'

const enabled = ref(false)
const visible = ref(false)
const state = ref<CursorState>('default')
const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)

const pointer = { x: 0, y: 0 }
const ringPosition = { x: 0, y: 0 }
let frame = 0
let queries: MediaQueryList[] = []

// Towarzysz ma sens tylko z myszą i bez prośby o ograniczenie ruchu
function allowed() {
  return (
    ENABLED &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Stan kursora wynika z elementu pod nim. Eksportowane do testów. */
function stateFor(target: Element | null): CursorState {
  if (!target) return 'default'
  if (target.closest(TEXT_FIELDS)) return 'text'
  if (target.closest(INTERACTIVE)) {
    // Tytuł karty jest linkiem rozciągniętym na całą kartę, więc liczy się jak karta
    return target.closest('.card .title') ? 'read' : 'link'
  }
  if (target.closest('.card')) return 'read'
  return 'default'
}

function render() {
  frame = 0
  ringPosition.x += (pointer.x - ringPosition.x) * RING_EASE
  ringPosition.y += (pointer.y - ringPosition.y) * RING_EASE
  if (dot.value) dot.value.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`
  if (ring.value) {
    ring.value.style.transform = `translate3d(${ringPosition.x}px, ${ringPosition.y}px, 0)`
  }
  // Pętla działa tylko wtedy, gdy pierścień jeszcze nie dogonił kursora
  const settled =
    Math.abs(pointer.x - ringPosition.x) < 0.1 && Math.abs(pointer.y - ringPosition.y) < 0.1
  if (!settled) frame = requestAnimationFrame(render)
}

function onMove(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  pointer.x = event.clientX
  pointer.y = event.clientY
  if (!visible.value) {
    // Pierścień pojawia się od razu przy kursorze, a nie wjeżdża z rogu ekranu
    ringPosition.x = pointer.x
    ringPosition.y = pointer.y
    visible.value = true
  }
  if (!frame) frame = requestAnimationFrame(render)
}

function onOver(event: PointerEvent) {
  if (event.pointerType === 'mouse') state.value = stateFor(event.target as Element)
}

function onLeaveWindow() {
  visible.value = false
}

function start() {
  if (enabled.value) return
  enabled.value = true
  window.addEventListener('pointermove', onMove, { passive: true })
  document.addEventListener('pointerover', onOver, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeaveWindow)
}

function stop() {
  enabled.value = false
  visible.value = false
  cancelAnimationFrame(frame)
  frame = 0
  window.removeEventListener('pointermove', onMove)
  document.removeEventListener('pointerover', onOver)
  document.documentElement.removeEventListener('pointerleave', onLeaveWindow)
}

// Podłączenie myszy do tabletu albo zmiana ustawień ruchu działa bez przeładowania
const refresh = () => (allowed() ? start() : stop())

onMounted(() => {
  if (typeof window.matchMedia !== 'function') return
  queries = [
    window.matchMedia('(hover: hover) and (pointer: fine)'),
    window.matchMedia('(prefers-reduced-motion: reduce)'),
  ]
  queries.forEach((query) => query.addEventListener('change', refresh))
  refresh()
})

onBeforeUnmount(() => {
  queries.forEach((query) => query.removeEventListener('change', refresh))
  stop()
})

defineExpose({ stateFor })
</script>

<template>
  <div v-if="enabled" class="cursor" :class="[`state-${state}`, { visible }]" aria-hidden="true">
    <div ref="ring" class="cursor-ring">
      <span class="ring-shape">
        <span class="ring-label">Czytaj</span>
      </span>
    </div>
    <div ref="dot" class="cursor-dot"></div>
  </div>
</template>

<style scoped>
.cursor {
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.cursor.visible {
  opacity: 1;
}

/* Oba elementy przesuwa tylko transform, więc ruch nie przelicza układu strony */
.cursor-ring,
.cursor-dot {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-cursor);
  pointer-events: none;
  will-change: transform;
}

.cursor-dot {
  width: 6px;
  height: 6px;
  margin: -3px 0 0 -3px;
  border-radius: 50%;
  background: var(--color-accent);
  transition: opacity var(--duration-fast) var(--ease-out);
}

.ring-shape {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  margin: -17px 0 0 -17px;
  border: 1.5px solid var(--color-primary);
  border-radius: 50%;
  background: transparent;
  transition:
    transform var(--duration-normal) var(--ease-spring),
    background-color var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}

.ring-label {
  color: var(--color-on-primary);
  font-family: var(--font-mono);
  font-size: 4.5px;
  font-weight: 700;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

/* Nad linkiem i przyciskiem pierścień rośnie, a kropka znika */
.state-link .ring-shape {
  transform: scale(1.5);
  background: color-mix(in srgb, var(--color-primary) 14%, transparent);
}

.state-link .cursor-dot {
  opacity: 0;
}

/* Nad kartą artykułu pierścień staje się wypełnionym przyciskiem „Czytaj” */
.state-read .ring-shape {
  transform: scale(2.4);
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.state-read .ring-label {
  opacity: 1;
}

.state-read .cursor-dot {
  opacity: 0;
}

/* W polu tekstowym towarzysz nie zasłania kursora tekstowego */
.state-text .ring-shape,
.state-text .cursor-dot {
  opacity: 0;
}
</style>
