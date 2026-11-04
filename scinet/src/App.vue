<script setup lang="ts">
import TopMenu from './components/TopMenu.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <TopMenu />
  <main>
    <RouterView v-slot="{ Component, route }">
      <!-- Klucz to sama ścieżka, więc zmiana filtrów w adresie nie uruchamia animacji -->
      <Transition name="page" mode="out-in">
        <div :key="route.path">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </main>
  <SiteFooter />
</template>

<style scoped>
/* Animujemy tylko pojawianie się: stara strona znika od razu, bez przeskoku przewijania */
.page-enter-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active {
    transition: none;
  }

  .page-enter-from {
    transform: none;
  }
}
</style>
