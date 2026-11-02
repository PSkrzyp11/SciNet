<script setup lang="ts">
import type { Article } from '@/data/articles'

defineProps<{ article: Article }>()
</script>

<template>
  <RouterLink :to="`/artykuly/${article.id}`" class="card">
    <span class="category">{{ article.category }}</span>
    <h3>{{ article.title }}</h3>
    <p>{{ article.excerpt }}</p>
    <footer>
      <span>{{ article.author }}</span>
      <span>{{ new Date(article.date).toLocaleDateString('pl-PL') }}</span>
    </footer>
    <span class="more">Czytaj dalej →</span>
  </RouterLink>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 28px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
}

.card:hover {
  transform: translateY(-3px);
  border-color: var(--color-primary);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.07);
}

.category {
  align-self: flex-start;
  padding: 3px 12px;
  border-radius: 999px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 600;
}

h3 {
  margin: 4px 0 0;
  font-size: 1.3rem;
}

p {
  margin: 0;
  flex: 1;
  color: var(--color-text-muted);
}

footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.more {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.95rem;
}
</style>
