<script setup lang="ts">
import { computed } from 'vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import { articles, readingTime } from '@/data/articles'

const props = defineProps<{ id: string }>()

const article = computed(() => articles.find((a) => a.id === Number(props.id)))

const related = computed(() =>
  articles.filter((a) => a.id !== article.value?.id && a.author === article.value?.author),
)
</script>

<template>
  <article v-if="article" class="article">
    <RouterLink to="/artykuly" class="back">← Wszystkie artykuły</RouterLink>

    <div class="top">
      <span class="category">{{ article.category }}</span>
      <FavoriteButton :article-id="article.id" with-label />
    </div>
    <h1>{{ article.title }}</h1>

    <div class="meta">
      <span>{{ article.author }}</span>
      <span>·</span>
      <span>{{ new Date(article.date).toLocaleDateString('pl-PL') }}</span>
      <span>·</span>
      <span>{{ readingTime(article) }} min czytania</span>
    </div>

    <p class="excerpt">{{ article.excerpt }}</p>
    <p v-for="(paragraph, i) in article.content" :key="i">{{ paragraph }}</p>

    <aside v-if="related.length" class="related">
      <h2>Więcej od autora</h2>
      <ul>
        <li v-for="item in related" :key="item.id">
          <RouterLink :to="`/artykuly/${item.id}`">{{ item.title }}</RouterLink>
        </li>
      </ul>
    </aside>
  </article>

  <div v-else class="not-found">
    <h1>Nie ma takiego artykułu</h1>
    <p class="lead">Mógł zostać usunięty albo link jest nieprawidłowy.</p>
    <RouterLink to="/artykuly">← Wróć do listy artykułów</RouterLink>
  </div>
</template>

<style scoped>
.article {
  max-width: 740px;
  margin: 0 auto;
  padding-top: 40px;
}

.back {
  display: block;
  width: fit-content;
  margin-bottom: 28px;
  font-weight: 600;
  text-decoration: none;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.category {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 999px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 600;
}

h1 {
  margin: 16px 0 12px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 32px;
  color: var(--color-text-muted);
}

.excerpt {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-text-soft);
}

p {
  margin: 0 0 22px;
  font-size: 1.1rem;
  line-height: 1.8;
}

.related {
  margin-top: 48px;
  padding: 28px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.related h2 {
  margin-bottom: 12px;
  font-size: 1.3rem;
}

.related ul {
  margin: 0;
  padding-left: 20px;
}

.related a {
  text-decoration: none;
  font-weight: 500;
}

.not-found {
  text-align: center;
}

.not-found .lead {
  margin: 0 auto 24px;
}
</style>
