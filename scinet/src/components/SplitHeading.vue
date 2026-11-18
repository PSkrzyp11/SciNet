<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { SplitText } from 'gsap/SplitText'
import { useReducedMotion } from '@/composables/useReducedMotion'
import { loadSplitText } from '@/motion/text'

const props = withDefaults(
  defineProps<{
    text: string
    /** Znacznik nagłówka. Czytnik ekranu dostaje cały tekst w `aria-label`. */
    as?: 'h1' | 'h2' | 'h3'
    /** `load`: od razu, `view`: gdy nagłówek wjedzie na ekran */
    trigger?: 'load' | 'view'
    /** Opóźnienie startu w sekundach */
    delay?: number
  }>(),
  { as: 'h1', trigger: 'load', delay: 0 },
)

// Jeśli biblioteka albo fonty się spóźnią, nagłówek pojawia się zwyczajnie (plan B)
const FALLBACK_MS = 1500

const el = ref<HTMLElement | null>(null)
// Do chwili podziału na linie tekst jest niewidoczny, ale zajmuje swoje miejsce
const pending = ref(false)
const reducedMotion = useReducedMotion()

let split: SplitText | null = null
let observer: IntersectionObserver | null = null
let fallback: ReturnType<typeof setTimeout> | undefined
// Każde uruchomienie ma numer, więc spóźniona odpowiedź poprzedniego nic nie zepsuje
let run = 0

async function reveal(target: HTMLElement, id: number) {
  try {
    const { gsap, SplitText } = await loadSplitText()
    // Linie liczymy po załadowaniu fontów, bo inny font łamie tekst w innych miejscach
    await document.fonts?.ready
    if (id !== run || !target.isConnected) return

    split = SplitText.create(target, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      // Ponowny podział po zmianie szerokości i po doczytaniu fontu, z zachowaniem animacji
      autoSplit: true,
      aria: 'auto',
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 115,
          duration: 1.1,
          ease: 'expo.out',
          stagger: 0.09,
          delay: props.delay,
        }),
    })
  } catch {
    // Bez GSAP zostaje zwykły nagłówek
  } finally {
    if (id === run) {
      clearTimeout(fallback)
      pending.value = false
    }
  }
}

function teardown() {
  run += 1
  observer?.disconnect()
  observer = null
  clearTimeout(fallback)
  split?.revert()
  split = null
  pending.value = false
}

function setup() {
  teardown()
  const target = el.value
  // W testach (bez IntersectionObserver) i przy ograniczonym ruchu nagłówek jest zwykłym tekstem
  if (!target || reducedMotion.value || typeof IntersectionObserver === 'undefined') return

  const id = run
  pending.value = true

  const start = () => {
    fallback = setTimeout(() => {
      if (id !== run) return
      run += 1
      pending.value = false
    }, FALLBACK_MS)
    void reveal(target, id)
  }

  if (props.trigger === 'load') return start()

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      observer?.disconnect()
      observer = null
      start()
    },
    { rootMargin: '0px 0px -10% 0px' },
  )
  observer.observe(target)
}

onMounted(setup)
onBeforeUnmount(teardown)

// Nowy tekst to nowy element (klucz), więc dzielimy go od początku
watch(
  () => props.text,
  async () => {
    teardown()
    await nextTick()
    setup()
  },
)

watch(reducedMotion, setup)
</script>

<template>
  <component
    :is="as"
    :key="text"
    ref="el"
    class="split-heading"
    :class="{ 'split-pending': pending }"
  >
    {{ text }}
  </component>
</template>

<style scoped>
.split-pending {
  visibility: hidden;
}

/* Maska linii przycina tekst, więc zostawiamy miejsce na ogonki liter (ą, ę, g, y) */
.split-heading :deep(.split-line-mask) {
  padding-bottom: 0.1em;
  margin-bottom: -0.1em;
}
</style>
