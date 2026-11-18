<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { useTheme } from '@/composables/useTheme'
import type { FromWorker, GradientColors, GradientSize, ToWorker } from './gradient-protocol'
import { hexToRgb } from './webgl'

// Gęstość pikseli ponad 1,5 nie poprawia miękkiego gradientu, a kosztuje kartę graficzną
const MAX_DPR = 1.5

const canvas = ref<HTMLCanvasElement | null>(null)
// Canvas pojawia się dopiero po pierwszej klatce, a pod nim zawsze jest gradient CSS
const ready = ref(false)
// Canvas przekazany do workera nie wraca na stronę, więc ponowny start wymaga nowego
const generation = ref(0)

const reducedMotion = useReducedMotion()
const { theme } = useTheme()

let stop: (() => void) | null = null
let refreshColors: (() => void) | null = null

// Render w workerze wymaga OffscreenCanvas (Chrome 69+, Firefox 105+, Safari 17+).
// Bez niego, a także w testach, zostaje statyczny gradient CSS.
function supported() {
  return (
    typeof Worker !== 'undefined' &&
    typeof IntersectionObserver !== 'undefined' &&
    typeof ResizeObserver !== 'undefined' &&
    'transferControlToOffscreen' in HTMLCanvasElement.prototype
  )
}

function readColors(el: HTMLElement): GradientColors {
  const style = getComputedStyle(el)
  const color = (token: string) => hexToRgb(style.getPropertyValue(token))
  return {
    base: color('--fx-base'),
    color1: color('--fx-color-1'),
    color2: color('--fx-color-2'),
    color3: color('--fx-color-3'),
    grain: parseFloat(style.getPropertyValue('--fx-grain')) || 0,
  }
}

function sizeOf(el: HTMLElement): GradientSize {
  const ratio = Math.min(window.devicePixelRatio || 1, MAX_DPR)
  return {
    width: Math.max(1, Math.round(el.clientWidth * ratio)),
    height: Math.max(1, Math.round(el.clientHeight * ratio)),
  }
}

function start() {
  const el = canvas.value
  if (!el || stop || !supported()) return

  const offscreen = el.transferControlToOffscreen()
  const worker = new Worker(new URL('./gradient.worker.ts', import.meta.url), { type: 'module' })
  const send = (message: ToWorker, transfer: Transferable[] = []) =>
    worker.postMessage(message, transfer)

  let inView = false
  // Render działa tylko wtedy, gdy hero jest na ekranie, a karta przeglądarki jest widoczna
  const update = () => send({ type: inView && !document.hidden ? 'play' : 'pause' })

  const viewObserver = new IntersectionObserver(([entry]) => {
    inView = Boolean(entry?.isIntersecting)
    update()
  })
  const sizeObserver = new ResizeObserver(() => send({ type: 'resize', ...sizeOf(el) }))

  function teardown() {
    worker.terminate()
    viewObserver.disconnect()
    sizeObserver.disconnect()
    document.removeEventListener('visibilitychange', update)
    ready.value = false
    stop = null
    refreshColors = null
  }

  worker.addEventListener('message', ({ data }: MessageEvent<FromWorker>) => {
    if (data.type === 'ready') ready.value = true
    else if (data.type === 'frames') el.dataset.frames = String(data.frames)
    // Bez WebGL albo na zbyt wolnym urządzeniu zostaje gradient CSS
    else teardown()
  })
  worker.addEventListener('error', teardown)

  send({ type: 'init', canvas: offscreen, colors: readColors(el), ...sizeOf(el) }, [offscreen])
  viewObserver.observe(el)
  sizeObserver.observe(el)
  document.addEventListener('visibilitychange', update)

  stop = teardown
  refreshColors = () => send({ type: 'colors', colors: readColors(el) })
}

onMounted(() => {
  if (!reducedMotion.value) start()
})

// Ustawienie „ogranicz ruch” może się zmienić przy otwartej stronie
watch(reducedMotion, async (reduced) => {
  if (reduced) return stop?.()
  generation.value += 1
  await nextTick()
  start()
})

// Kolory gradientu pochodzą z tokenów, więc po zmianie motywu czytamy je ponownie
watch(theme, async () => {
  await nextTick()
  refreshColors?.()
})

onBeforeUnmount(() => stop?.())
</script>

<template>
  <canvas
    :key="generation"
    ref="canvas"
    class="gradient-canvas"
    :class="{ ready }"
    aria-hidden="true"
  ></canvas>
</template>

<style scoped>
.gradient-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-reveal) var(--ease-out);
}

.gradient-canvas.ready {
  opacity: 1;
}
</style>
