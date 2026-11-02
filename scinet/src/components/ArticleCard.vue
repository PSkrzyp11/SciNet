<script setup lang="ts">
import type { Article } from '@/data/articles'

defineProps<{ article: Article }>()
</script>

<template>
  <article class="card">
    <span class="category">{{ article.category }}</span>
    <h3>{{ article.title }}</h3>
    <p>{{ article.excerpt }}</p>
    <footer>
      <span>{{ article.author }}</span>
      <span>{{ new Date(article.date).toLocaleDateString('pl-PL') }}</span>
    </footer>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.category {
  align-self: flex-start;
  padding: 2px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 0.8rem;
  font-weight: 600;
}

h3 {
  margin: 4px 0 0;
  font-size: 1.1rem;
  color: #1f2937;
}

p {
  margin: 0;
  flex: 1;
  color: #6b7280;
  line-height: 1.5;
}

footer {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 0.85rem;
  color: #9ca3af;
}
</style>
