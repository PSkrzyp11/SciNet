<script setup lang="ts">
import type { Article } from '@/data/articles'

defineProps<{ articles: Article[] }>()
</script>

<template>
  <section class="top-liked">
    <h2>Najczęściej polubione</h2>

    <ol v-if="articles.length">
      <li v-for="article in articles" :key="article.id">
        <RouterLink :to="`/artykuly/${article.id}`">{{ article.title }}</RouterLink>
        <span class="count" :title="`Polubienia: ${article.likes}`">{{ article.likes }}</span>
      </li>
    </ol>

    <p v-else class="empty">Żaden artykuł nie ma jeszcze polubień.</p>
  </section>
</template>

<style scoped>
.top-liked {
  padding: 24px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

h2 {
  margin: 0 0 12px;
  font-size: 1.15rem;
}

ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid var(--color-border);
  font-size: 0.95rem;
  line-height: 1.4;
}

/* Odstęp należy do linku, więc cały wiersz da się wygodnie dotknąć */
a {
  flex: 1;
  min-width: 0;
  padding: 10px 0;
  font-weight: 500;
  text-decoration: none;
  overflow-wrap: anywhere;
}

a:hover {
  text-decoration: underline;
}

.count {
  flex-shrink: 0;
  padding: 0 8px;
  border-radius: 999px;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}
</style>
