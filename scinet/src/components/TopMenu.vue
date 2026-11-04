<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'

const route = useRoute()
const favorites = useFavoritesStore()

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
  <header class="top-menu">
    <RouterLink to="/" class="logo">Sci<span>Net</span></RouterLink>

    <nav>
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="{ active: isActive(link.to) }"
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
</style>
