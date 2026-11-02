<script setup lang="ts">
import { computed, ref } from 'vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { articles } from '@/data/articles'

const categories = ['Wszystkie', ...new Set(articles.map((a) => a.category))]
const selected = ref('Wszystkie')

const filtered = computed(() =>
  selected.value === 'Wszystkie'
    ? articles
    : articles.filter((a) => a.category === selected.value),
)
</script>

<template>
  <h1>Artykuły</h1>

  <div class="filters">
    <button
      v-for="category in categories"
      :key="category"
      :class="{ active: category === selected }"
      @click="selected = category"
    >
      {{ category }}
    </button>
  </div>

  <div class="grid">
    <ArticleCard v-for="article in filtered" :key="article.id" :article="article" />
  </div>
</template>

<style scoped>
h1 {
  margin: 32px 0 20px;
  color: #1f2937;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

button {
  padding: 6px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  background: #fff;
  color: #4b5563;
  font: inherit;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

button:hover {
  background: #f3f4f6;
}

button.active {
  border-color: #4f46e5;
  background: #4f46e5;
  color: #fff;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}
</style>
