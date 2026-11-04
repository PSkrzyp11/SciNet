<script setup lang="ts">
import FavoriteButton from '@/components/FavoriteButton.vue'
import { readingTime, type Article } from '@/data/articles'
import { authorName } from '@/data/authors'

defineProps<{ article: Article }>()
</script>

<template>
  <article class="card">
    <div class="top">
      <span class="category">{{ article.category }}</span>
      <FavoriteButton :article-id="article.id" />
    </div>
    <h3>
      <RouterLink :to="`/artykuly/${article.id}`" class="title">{{ article.title }}</RouterLink>
    </h3>
    <p>{{ article.excerpt }}</p>
    <footer>
      <span>{{ authorName(article.authorId) }}</span>
      <span>{{ new Date(article.date).toLocaleDateString('pl-PL') }}</span>
    </footer>
    <div class="bottom">
      <span class="more">Czytaj dalej →</span>
      <span class="time">{{ readingTime(article) }} min czytania</span>
    </div>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 28px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
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

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.category {
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

.title {
  color: inherit;
  text-decoration: none;
}

/* Tytuł jest linkiem, a ta warstwa rozciąga go na całą kartę */
.title::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
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

.bottom {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.time {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.more {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.95rem;
}
</style>
