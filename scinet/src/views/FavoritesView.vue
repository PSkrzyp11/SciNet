<script setup lang="ts">
import ArticleCard from '@/components/ArticleCard.vue'
import { useArticlesStore } from '@/stores/articles'
import { useFavoritesStore } from '@/stores/favorites'

const store = useArticlesStore()
const favorites = useFavoritesStore()
</script>

<template>
  <header class="page-head">
    <span class="eyebrow">Prywatna czytelnia</span>
    <h1>Zapisane</h1>
    <p class="lead">Artykuły, do których chcesz wrócić. Lista jest zapisana w tej przeglądarce.</p>
  </header>

  <TransitionGroup v-if="favorites.count" name="fav-list" tag="div" class="grid">
    <ArticleCard
      v-for="article in favorites.savedArticles"
      :key="article.id"
      :article="article"
      @delete="store.remove(article.id)"
      @like="store.toggleLike(article.id)"
    />
  </TransitionGroup>

  <div v-else class="empty">
    <svg class="empty-art" viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
      <path d="M18 10h28a3 3 0 0 1 3 3v41l-17-10-17 10V13a3 3 0 0 1 3-3z" />
    </svg>
    <p>Nie masz jeszcze zapisanych artykułów.</p>
    <RouterLink to="/" class="btn">Przeglądaj artykuły</RouterLink>
  </div>
</template>

<style scoped>
.page-head {
  margin-top: var(--space-8);
}

.eyebrow {
  display: inline-block;
  margin-bottom: var(--space-1);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--color-primary);
}

h1 {
  margin-top: 0;
}

.grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr));
  gap: var(--space-6);
}

.fav-list-move,
.fav-list-enter-active,
.fav-list-leave-active {
  transition:
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}

.fav-list-enter-from,
.fav-list-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.97);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-9) var(--space-6);
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius);
  color: var(--color-text-muted);
}

.empty-art {
  fill: var(--color-accent-light);
  stroke: var(--color-primary);
  stroke-width: 2;
  stroke-linejoin: round;
}

.empty p {
  margin: 0;
}

.btn {
  display: inline-block;
  margin-top: var(--space-2);
  padding: var(--space-3) 26px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
  text-decoration: none;
  box-shadow: var(--shadow-xs);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring),
    box-shadow var(--duration-fast) var(--ease-out);
}

.btn:hover {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.btn:active {
  transform: scale(0.97);
}
</style>
