<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ src?: string; alt: string }>()

const failed = ref(false)

// Nowy adres (np. po edycji artykułu) dostaje kolejną szansę
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)
</script>

<template>
  <!-- Bez adresu albo przy błędzie nie zostaje żadna pusta ramka -->
  <img
    v-if="src && !failed"
    class="article-image"
    :src="src"
    :alt="alt"
    loading="lazy"
    referrerpolicy="no-referrer"
    @error="failed = true"
  />
</template>

<style scoped>
.article-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 10px;
  background: var(--color-primary-light);
}
</style>
