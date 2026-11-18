<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    items: readonly string[]
    /** Nazwa nawigacji dla czytników ekranu */
    label: string
    /** Duży wariant do stopki */
    size?: 'sm' | 'lg'
    /** Ruch w prawo zamiast w lewo */
    reverse?: boolean
  }>(),
  { size: 'sm', reverse: false },
)

// Każda połowa paska powtarza listę, żeby była szersza od ekranu i pętla nie miała dziury
const REPEAT = 2
const halves = [0, 1]
const repeats = Array.from({ length: REPEAT }, (_, i) => i)

// Przycisk zatrzymania spełnia WCAG 2.2.2: ruch trwający ponad 5 s musi dać się zatrzymać
const stopped = ref(false)

// Tylko pierwsza kopia jest dostępna dla klawiatury i czytników, reszta to powtórzenia
const isCopy = (half: number, repeat: number) => half > 0 || repeat > 0

const linkTo = (item: string) => ({ path: '/', query: { kategoria: item } })
</script>

<template>
  <nav class="marquee" :class="[`marquee-${size}`, { stopped, reverse }]" :aria-label="label">
    <div class="marquee-viewport">
      <div class="marquee-track">
        <ul
          v-for="half in halves"
          :key="half"
          class="marquee-group"
          :aria-hidden="half > 0 ? 'true' : undefined"
        >
          <template v-for="repeat in repeats" :key="repeat">
            <li
              v-for="item in items"
              :key="`${repeat}-${item}`"
              :aria-hidden="half === 0 && repeat > 0 ? 'true' : undefined"
            >
              <RouterLink :to="linkTo(item)" :tabindex="isCopy(half, repeat) ? -1 : undefined">
                {{ item }}
              </RouterLink>
              <span class="marquee-star" aria-hidden="true">✦</span>
            </li>
          </template>
        </ul>
      </div>
    </div>
    <button
      type="button"
      class="marquee-toggle"
      :aria-pressed="stopped"
      @click="stopped = !stopped"
    >
      <span aria-hidden="true">{{ stopped ? '▶' : '❚❚' }}</span>
      <span class="visually-hidden">Zatrzymaj przewijanie paska</span>
    </button>
  </nav>
</template>

<style scoped>
.marquee {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.marquee-viewport {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  /* Miękkie wygaszenie na krawędziach zamiast ostrego cięcia */
  mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
}

.marquee-track {
  display: flex;
  width: max-content;
  animation: marquee var(--marquee-duration, 60s) linear infinite;
}

.reverse .marquee-track {
  animation-direction: reverse;
}

/* Pasek staje po najechaniu, po wejściu klawiaturą i po kliknięciu przycisku */
.marquee:hover .marquee-track,
.marquee:focus-within .marquee-track,
.stopped .marquee-track {
  animation-play-state: paused;
}

.marquee-group {
  display: flex;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.marquee-group li {
  display: flex;
  align-items: center;
}

.marquee a {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--color-text-soft);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--duration-fast) var(--ease-out);
}

.marquee a:hover {
  color: var(--color-primary);
}

.marquee a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}

.marquee-star {
  color: var(--color-accent);
  font-size: var(--text-2xs);
}

/* Stopka: duże litery w foncie nagłówków */
.marquee-lg a {
  padding: var(--space-2) var(--space-5);
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 1rem + 3vw, 3.5rem);
  font-weight: 700;
  letter-spacing: var(--tracking-tight);
  text-transform: none;
  color: var(--color-text);
}

.marquee-lg .marquee-star {
  font-size: var(--text-lg);
}

.marquee-toggle {
  /* Przesuwany pasek ma transform i maskę, więc rysuje się wyżej. Przycisk musi leżeć
     nad nim, inaczej przycięte linki formalnie go zasłaniają (audyt rozmiaru celu). */
  position: relative;
  z-index: var(--z-raised);
  display: inline-grid;
  flex-shrink: 0;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-text-soft);
  font-size: var(--text-2xs);
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.marquee-toggle:hover {
  border-color: var(--color-primary-border);
  color: var(--color-primary);
}

@media (pointer: coarse) {
  .marquee-toggle {
    width: 44px;
    height: 44px;
  }
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

/* Przy ograniczonym ruchu pasek stoi, a przycisk nie jest potrzebny */
@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }

  .marquee-toggle {
    display: none;
  }
}
</style>
