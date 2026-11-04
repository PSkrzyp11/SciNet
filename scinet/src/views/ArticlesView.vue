<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import { articles, type Article } from '@/data/articles'
import { authorName } from '@/data/authors'

const sorters = {
  newest: (a: Article, b: Article) => b.date.localeCompare(a.date),
  oldest: (a: Article, b: Article) => a.date.localeCompare(b.date),
  title: (a: Article, b: Article) => a.title.localeCompare(b.title, 'pl'),
}

const categories = ['Wszystkie', ...new Set(articles.map((a) => a.category))]
const route = useRoute()
const router = useRouter()

function queryParam(name: string) {
  const value = route.query[name]
  return typeof value === 'string' ? value : ''
}

function updateQuery(changes: Record<string, string | undefined>) {
  router.replace({ query: { ...route.query, ...changes } })
}

// Kategoria i wyszukiwanie są trzymane w adresie, np. /artykuly?kategoria=Fizyka&q=kwant
const selected = computed({
  get: () => {
    const category = queryParam('kategoria')
    return categories.includes(category) ? category : 'Wszystkie'
  },
  set: (category) => updateQuery({ kategoria: category === 'Wszystkie' ? undefined : category }),
})

const search = computed({
  get: () => queryParam('q'),
  set: (text) => updateQuery({ q: text || undefined }),
})

const sort = ref<keyof typeof sorters>('newest')

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()

  return articles
    .filter((a) => {
      const inCategory = selected.value === 'Wszystkie' || a.category === selected.value
      const matches =
        !query ||
        [a.title, a.excerpt, authorName(a.authorId)].some((text) =>
          text.toLowerCase().includes(query),
        )
      return inCategory && matches
    })
    .sort(sorters[sort.value])
})

function reset() {
  updateQuery({ q: undefined, kategoria: undefined })
}
</script>

<template>
  <h1>Artykuły</h1>

  <input
    v-model="search"
    type="search"
    class="search"
    placeholder="Szukaj po tytule, opisie lub autorze…"
  />

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

  <div class="toolbar">
    <p class="count">Znaleziono: {{ filtered.length }}</p>
    <label class="sort">
      Sortuj:
      <select v-model="sort">
        <option value="newest">Najnowsze</option>
        <option value="oldest">Najstarsze</option>
        <option value="title">A–Z</option>
      </select>
    </label>
  </div>

  <div v-if="filtered.length" class="grid">
    <ArticleCard v-for="article in filtered" :key="article.id" :article="article" />
  </div>

  <div v-else class="empty">
    <p>Nie znaleźliśmy artykułów pasujących do wyszukiwania.</p>
    <button class="reset" @click="reset">Wyczyść filtry</button>
  </div>
</template>

<style scoped>
h1 {
  margin: 80px 0 32px;
  text-align: center;
}

.search {
  display: block;
  width: 100%;
  max-width: 560px;
  padding: 14px 18px;
  margin: 0 auto 20px;
  border: 1px solid var(--color-input-border);
  border-radius: 12px;
  background: var(--color-surface);
  transition: border-color 0.2s;
}

.search:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.filters button {
  padding: 8px 18px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-nav);
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.filters button:hover {
  background: var(--color-hover);
}

.filters button.active {
  border-color: var(--color-button);
  background: var(--color-button);
  color: #fff;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}

.sort {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.sort select {
  padding: 8px 12px;
  border: 1px solid var(--color-input-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.count {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

.reset {
  padding: 10px 22px;
  border: none;
  border-radius: 10px;
  background: var(--color-button);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
</style>
