<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import SiteFooter from './components/SiteFooter.vue'
import TopMenu from './components/TopMenu.vue'
import ToastContainer from './components/ui/ToastContainer.vue'

// Kursor-towarzysz przydaje się tylko z myszą, więc ładuje się osobno, po starcie strony
const CursorFollower = defineAsyncComponent(() => import('./components/CursorFollower.vue'))
</script>

<template>
  <TopMenu />
  <main>
    <RouterView v-slot="{ Component, route }">
      <!-- Klucz to sama ścieżka, więc zmiana filtrów w adresie nie uruchamia animacji -->
      <Transition name="page" mode="out-in">
        <div :key="route.path" class="page-view">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </main>
  <SiteFooter />
  <ToastContainer />
  <CursorFollower />
</template>

<style scoped>
/* Animujemy tylko pojawianie się: stara strona znika od razu, bez przeskoku przewijania */
.page-enter-active {
  transition:
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
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
