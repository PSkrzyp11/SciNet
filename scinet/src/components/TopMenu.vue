<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'

const route = useRoute()
const favorites = useFavoritesStore()

const open = ref(false)
const toggleButton = ref<HTMLButtonElement | null>(null)

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
  { to: '/', label: 'Start' },
  { to: '/artykuly', label: 'Artykuły' },
  { to: '/autorzy', label: 'Autorzy' },
  { to: '/zapisane', label: 'Zapisane' },
  { to: '/kontakt', label: 'Kontakt' },
]

// Podstrona artykułu (/artykuly/3) też podświetla zakładkę „Artykuły”
const isActive = (to: string) =>
  route.path === to || (to !== '/' && route.path.startsWith(`${to}/`))
</script>

<template>
  <header class="top-menu" @keydown.esc="closeOnEscape">
    <RouterLink to="/" class="logo">Sci<span>Net</span></RouterLink>

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

    <nav id="main-menu" :class="{ open }">
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
  </header>
</template>

<style scoped>
.top-menu {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 32px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  text-decoration: none;
}

.logo span {
  color: var(--color-primary);
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

nav a {
  padding: 10px 18px;
  border-radius: 10px;
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition:
    background 0.2s,
    color 0.2s;
}

nav a:hover {
  background: #f3f4f6;
  color: var(--color-text);
}

.badge {
  display: inline-block;
  min-width: 22px;
  margin-left: 4px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 22px;
  text-align: center;
}

nav a.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.menu-toggle {
  display: none;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: none;
  color: var(--color-text);
  cursor: pointer;
}

.menu-toggle svg {
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

@media (max-width: 760px) {
  .top-menu {
    padding: 12px 20px;
  }

  .menu-toggle {
    display: block;
  }

  nav {
    display: none;
    flex-basis: 100%;
    flex-direction: column;
  }

  nav.open {
    display: flex;
  }

  nav a {
    padding: 12px 14px;
  }
}
</style>
