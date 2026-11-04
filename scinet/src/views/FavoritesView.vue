<script setup lang="ts">
import ArticleCard from '@/components/ArticleCard.vue'
import { useArticlesStore } from '@/stores/articles'
import { useFavoritesStore } from '@/stores/favorites'

const store = useArticlesStore()
const favorites = useFavoritesStore()
</script>

<template>
  <h1>Zapisane</h1>
  <p class="lead">Artykuły, do których chcesz wrócić. Lista jest zapisana w tej przeglądarce.</p>

  <div v-if="favorites.count" class="grid">
    <ArticleCard
      v-for="article in favorites.savedArticles"
      :key="article.id"
      :article="article"
      @delete="store.remove(article.id)"
      @like="store.toggleLike(article.id)"
    />
  </div>

  <div v-else class="empty">
    <p>Nie masz jeszcze zapisanych artykułów.</p>
    <RouterLink to="/" class="btn">Przeglądaj artykuły</RouterLink>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: 24px;
}

.empty {
  padding: 48px 24px;
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-input-border);
  border-radius: var(--radius);
  color: var(--color-text-muted);
}

.empty p {
  margin: 0 0 16px;
}

.btn {
  display: inline-block;
  padding: 10px 22px;
  border-radius: 10px;
  background: var(--color-button);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
}

.btn:hover {
  background: var(--color-button-hover);
}
</style>
