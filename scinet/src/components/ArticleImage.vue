<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ src?: string; alt: string }>()

const failed = ref(false)
const loaded = ref(false)

// Nowy adres (np. po edycji artykułu) dostaje kolejną szansę
watch(
  () => props.src,
  () => {
    failed.value = false
    loaded.value = false
  },
)
</script>

<template>
  <!-- Bez adresu albo przy błędzie nie zostaje żadna pusta ramka -->
  <img
    v-if="src && !failed"
    class="article-image"
    :class="{ loaded }"
    :src="src"
    :alt="alt"
    loading="lazy"
    referrerpolicy="no-referrer"
    @load="loaded = true"
    @error="failed = true"
  />
</template>

<style scoped>
.article-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
  background: linear-gradient(
    90deg,
    var(--color-bg-subtle) 20%,
    var(--color-primary-light) 50%,
    var(--color-bg-subtle) 80%
  );
  background-size: 200% 100%;
  animation: image-shimmer var(--duration-shimmer) var(--ease-in-out) infinite;
  transition:
    transform var(--duration-slow) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}

.article-image.loaded {
  animation: none;
  background: var(--color-bg-subtle);
}

@keyframes image-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .article-image {
    animation: none;
  }
}
</style>
