<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import SiteFooter from './components/SiteFooter.vue'
import TopMenu from './components/TopMenu.vue'
import ToastContainer from './components/ui/ToastContainer.vue'
import { useFxTier } from './composables/useFxTier'
import { viewTransitionsEnabled } from './motion/viewTransition'

// Kursor-towarzysz przydaje się tylko z myszą, więc ładuje się osobno, po starcie strony,
// i tylko na pełnym poziomie efektów. Na telefonie jego kod w ogóle się nie pobiera.
const CursorFollower = defineAsyncComponent(() => import('./components/CursorFollower.vue'))
const { isFull } = useFxTier()
</script>

<template>
  <TopMenu />
  <!-- Po zmianie strony fokus trafia tutaj, więc czytnik zaczyna od nowej treści -->
  <main id="main" tabindex="-1">
    <RouterView v-slot="{ Component, route }">
      <!-- Z View Transitions animację robi przeglądarka, więc strona podmienia się od razu -->
      <div v-if="viewTransitionsEnabled" :key="route.path" class="page-view">
        <component :is="Component" />
      </div>
      <!-- Klucz to sama ścieżka, więc zmiana filtrów w adresie nie uruchamia animacji -->
      <Transition v-else name="page" mode="out-in">
        <div :key="route.path" class="page-view">
          <component :is="Component" />
        </div>
      </Transition>
    </RouterView>
  </main>
  <SiteFooter />
  <ToastContainer />
  <CursorFollower v-if="isFull" />
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
