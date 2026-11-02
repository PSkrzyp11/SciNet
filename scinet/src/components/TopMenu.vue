<script setup lang="ts">
const links = [
  { to: '/', label: 'Start' },
  { to: '/artykuly', label: 'Artykuły' },
  { to: '/autorzy', label: 'Autorzy' },
  { to: '/kontakt', label: 'Kontakt' },
]
</script>

<template>
  <header class="top-menu">
    <RouterLink to="/" class="logo">Sci<span>Net</span></RouterLink>

    <nav>
      <RouterLink v-for="link in links" :key="link.to" :to="link.to" exact-active-class="active">
        {{ link.label }}
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
  padding: 14px 24px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
}

.logo {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1f2937;
  text-decoration: none;
}

.logo span {
  color: #4f46e5;
}

nav {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

nav a {
  padding: 8px 14px;
  border-radius: 8px;
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition:
    background 0.2s,
    color 0.2s;
}

nav a:hover {
  background: #f3f4f6;
  color: #1f2937;
}

nav a.active {
  background: #eef2ff;
  color: #4f46e5;
}
</style>
