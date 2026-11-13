<script setup lang="ts">
import type { Article } from '@/data/articles'

defineProps<{ articles: Article[] }>()
</script>

<template>
  <section class="top-liked">
    <header class="panel-head">
      <h2>Najczęściej polubione</h2>
      <span class="spark" aria-hidden="true">★</span>
    </header>

    <TransitionGroup v-if="articles.length" name="rank-list" tag="ol">
      <li v-for="article in articles" :key="article.id">
        <RouterLink :to="`/artykuly/${article.id}`">{{ article.title }}</RouterLink>
        <span class="count" :title="`Polubienia: ${article.likes}`">{{ article.likes }}</span>
      </li>
    </TransitionGroup>

    <p v-else class="empty">Żaden artykuł nie ma jeszcze polubień.</p>
  </section>
</template>

<style scoped>
.top-liked {
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-md);
}

.spark {
  display: inline-grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-accent-light);
  color: var(--color-on-accent);
  font-size: var(--text-xs);
}

[data-theme='dark'] .spark {
  color: var(--color-accent);
}

ol {
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: rank;
}

li {
  counter-increment: rank;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  border-top: 1px solid var(--color-border-subtle);
  font-size: var(--text-sm);
  line-height: 1.38;
  transition:
    transform var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

/* Numeracja redakcyjna 01–05 w pseudoelemencie (nie wpływa na tekst linku) */
li::before {
  content: '0' counter(rank);
  flex-shrink: 0;
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-muted);
}

li:first-child::before {
  color: var(--color-primary);
}

li:hover {
  transform: translateX(3px);
}

/* Odstęp należy do linku, więc cały wiersz da się wygodnie dotknąć */
a {
  flex: 1;
  min-width: 0;
  padding: var(--space-3) 0;
  color: var(--color-text);
  font-weight: 500;
  text-decoration: none;
  overflow-wrap: anywhere;
  transition: color var(--duration-fast) var(--ease-out);
}

a:hover {
  color: var(--color-primary);
}

.count {
  flex-shrink: 0;
  padding: var(--space-05) var(--space-25);
  border-radius: var(--radius-pill);
  background: var(--color-accent-light);
  border: 1px solid var(--color-accent-border);
  color: var(--color-on-accent);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

[data-theme='dark'] .count {
  color: var(--color-accent);
}

.empty {
  margin: 0;
  padding: var(--space-3) 0 var(--space-1);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.rank-list-move,
.rank-list-enter-active,
.rank-list-leave-active {
  transition:
    transform var(--duration-normal) var(--ease-out),
    opacity var(--duration-normal) var(--ease-out);
}

.rank-list-enter-from,
.rank-list-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
