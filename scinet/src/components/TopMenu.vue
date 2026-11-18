<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useFavoritesStore } from '@/stores/favorites'

const route = useRoute()
const favorites = useFavoritesStore()
const { theme, toggleTheme } = useTheme()

const open = ref(false)
const toggleButton = ref<HTMLButtonElement | null>(null)
const header = ref<HTMLElement | null>(null)
const nav = ref<HTMLElement | null>(null)

// Pasek chowa się po przewinięciu w dół o tyle pikseli od góry strony
const HIDE_AFTER = 120
// Drobne drgnięcia scrolla nie przełączają paska
const SCROLL_DELTA = 6

// Menu zamyka się po przejściu na inną stronę (także przez logo albo przycisk „wstecz”)
watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)

function closeOnEscape() {
  if (!open.value) return
  open.value = false
  toggleButton.value?.focus()
}

const links = [
  { to: '/', label: 'Tablica' },
  { to: '/autorzy', label: 'Autorzy' },
  { to: '/zapisane', label: 'Zapisane' },
  { to: '/kontakt', label: 'Kontakt' },
]

// Strona artykułu (/artykuly/3) też podświetla zakładkę „Tablica”
const isActive = (to: string) =>
  route.path === to || (to === '/' && route.path.startsWith('/artykuly/'))

// Wskaźnik aktywnej zakładki przesuwa się pod nią zamiast przeskakiwać
const indicator = reactive({ x: 0, width: 0, visible: false })
// Pierwsze ustawienie wskaźnika jest bez animacji, żeby nie wjeżdżał z lewej
const indicatorReady = ref(false)

function placeIndicator() {
  const active = nav.value?.querySelector<HTMLElement>('a.active')
  indicator.visible = Boolean(active)
  if (!active) return
  indicator.x = active.offsetLeft
  indicator.width = active.offsetWidth
}

watch(
  () => route.path,
  () => nextTick(placeIndicator),
)

// Przy przewijaniu w dół pasek się chowa, przy przewijaniu w górę wraca
const hidden = ref(false)
let lastY = 0
let scrollFrame = 0

function updateHidden() {
  scrollFrame = 0
  const y = window.scrollY
  // Otwarte menu i fokus z klawiatury w pasku zawsze go pokazują
  if (open.value || header.value?.contains(document.activeElement) || y <= HIDE_AFTER) {
    hidden.value = false
  } else if (y > lastY + SCROLL_DELTA) {
    hidden.value = true
  } else if (y < lastY - SCROLL_DELTA) {
    hidden.value = false
  }
  if (Math.abs(y - lastY) > SCROLL_DELTA) lastY = y
}

function onScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateHidden)
}

let navObserver: ResizeObserver | null = null

onMounted(() => {
  placeIndicator()
  // Szerokość zakładek zmienia się jeszcze po wczytaniu fontu
  void document.fonts?.ready.then(placeIndicator)
  if (typeof ResizeObserver !== 'undefined' && nav.value) {
    navObserver = new ResizeObserver(placeIndicator)
    navObserver.observe(nav.value)
  }
  requestAnimationFrame(() => (indicatorReady.value = true))
  lastY = window.scrollY
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  navObserver?.disconnect()
  cancelAnimationFrame(scrollFrame)
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <header
    ref="header"
    class="top-menu"
    :class="{ hidden }"
    @keydown.esc="closeOnEscape"
    @focusin="hidden = false"
  >
    <div class="top-menu-inner">
      <RouterLink to="/" class="logo">
        <span class="logo-mark" aria-hidden="true">✦</span>
        Sci<span>Net</span>
      </RouterLink>

      <nav id="main-menu" ref="nav" :class="{ open }">
        <span
          v-show="indicator.visible"
          class="nav-indicator"
          :class="{ ready: indicatorReady }"
          :style="{ width: `${indicator.width}px`, transform: `translateX(${indicator.x}px)` }"
          aria-hidden="true"
        ></span>
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="{ active: isActive(link.to) }"
          @click="open = false"
        >
          {{ link.label }}
          <span v-if="link.to === '/zapisane' && favorites.count" class="badge">
            {{ favorites.count }}
          </span>
        </RouterLink>
      </nav>

      <div class="menu-actions">
        <label
          class="theme-switch"
          :title="theme === 'dark' ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'"
        >
          <input
            type="checkbox"
            role="switch"
            class="visually-hidden"
            :checked="theme === 'dark'"
            aria-label="Tryb ciemny"
            @change="toggleTheme"
          />
          <span class="theme-icon" aria-hidden="true">
            <svg v-if="theme === 'dark'" viewBox="0 0 24 24" width="18" height="18">
              <circle cx="12" cy="12" r="4" />
              <path
                d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
              />
            </svg>
            <svg v-else viewBox="0 0 24 24" width="18" height="18">
              <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
            </svg>
          </span>
        </label>

        <button
          ref="toggleButton"
          type="button"
          class="menu-toggle"
          aria-controls="main-menu"
          :aria-expanded="open"
          aria-label="Menu"
          @click="open = !open"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path v-if="open" d="M6 6l12 12M18 6L6 18" />
            <path v-else d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-menu {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  transform: translateY(0);
  background: var(--color-surface-glass);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  transition:
    background-color var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}

/* Schowany pasek wyjeżdża w górę (transform, więc nic pod nim się nie przesuwa) */
.top-menu.hidden {
  transform: translateY(-100%);
}

/* Subtelna królewska linia akcentowa u góry ekranu */
.top-menu::before {
  content: '';
  display: block;
  height: 3px;
  background: linear-gradient(
    90deg,
    var(--color-primary) 0%,
    var(--color-accent) 50%,
    var(--color-primary) 100%
  );
}

.top-menu-inner {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
  max-width: var(--board-max-width);
  margin: 0 auto;
  padding: 12px var(--space-7);
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-right: auto;
  font-family: var(--font-display);
  font-size: var(--text-brand);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-text);
  text-decoration: none;
  transition: transform var(--duration-fast) var(--ease-spring);
}

.logo:hover {
  transform: translateY(-1px);
}

.logo-mark {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-xs);
  background: var(--color-primary);
  color: var(--color-accent);
  font-size: var(--text-sm);
  box-shadow: var(--shadow-xs);
}

.logo span:not(.logo-mark) {
  color: var(--color-primary);
}

nav {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-1);
  padding: var(--space-1);
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
}

/* Tło aktywnej zakładki, które przesuwa się między zakładkami */
.nav-indicator {
  position: absolute;
  top: var(--space-1);
  bottom: var(--space-1);
  left: 0;
  border-radius: var(--radius-pill);
  background: var(--color-primary);
  box-shadow: var(--shadow-xs);
  pointer-events: none;
}

.nav-indicator.ready {
  transition:
    transform var(--duration-normal) var(--ease-expo),
    width var(--duration-normal) var(--ease-expo);
}

nav a {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--space-15);
  padding: var(--space-2) 18px;
  border-radius: var(--radius-pill);
  color: var(--color-text-soft);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 600;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

nav a:hover {
  color: var(--color-primary);
  background: var(--color-primary-subtle);
}

nav a.active {
  color: var(--color-on-primary);
}

nav a.active:hover {
  background: transparent;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--space-15);
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

nav a.active .badge {
  background: var(--color-accent);
  color: var(--color-on-accent);
}

.menu-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.theme-switch {
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--color-border-strong);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-text-soft);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.theme-switch:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
}

.theme-switch:active {
  transform: scale(0.92);
}

.theme-switch:has(input:focus-visible) {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.theme-icon {
  display: inline-grid;
  place-items: center;
}

.theme-icon svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform var(--duration-normal) var(--ease-spring);
}

.theme-switch:hover .theme-icon svg {
  transform: rotate(16deg) scale(1.08);
}

.menu-toggle {
  display: none;
  padding: var(--space-2);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.menu-toggle:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-border);
}

.menu-toggle svg {
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (max-width: 860px) {
  .top-menu-inner {
    padding: 10px var(--space-5);
  }

  .menu-toggle {
    display: block;
  }

  nav {
    display: none;
    order: 3;
    flex-basis: 100%;
    flex-direction: column;
    align-items: stretch;
    padding: var(--space-2);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    box-shadow: var(--shadow-sm);
  }

  nav.open {
    display: flex;
    animation: mobile-menu-in var(--duration-normal) var(--ease-out);
  }

  @keyframes mobile-menu-in {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  nav a {
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-sm);
  }

  /* W rozwijanym menu na telefonie aktywna zakładka ma zwykłe tło zamiast wskaźnika */
  .nav-indicator {
    display: none;
  }

  nav a.active,
  nav a.active:hover {
    background: var(--color-primary);
  }
}
</style>
