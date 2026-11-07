<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import ArticleForm from '@/components/ArticleForm.vue'
import AuthorAvatar from '@/components/AuthorAvatar.vue'
import TopLikedPanel from '@/components/TopLikedPanel.vue'
import UserCard from '@/components/UserCard.vue'
import { CATEGORIES, type Article, type ArticleDraft } from '@/data/articles'
import { currentUser } from '@/data/authors'
import { useArticlesStore } from '@/stores/articles'

const sorters = {
  newest: (a: Article, b: Article) => b.date.localeCompare(a.date),
  oldest: (a: Article, b: Article) => a.date.localeCompare(b.date),
  title: (a: Article, b: Article) => a.title.localeCompare(b.title, 'pl'),
}

const store = useArticlesStore()
// Stała kolejność: nowy artykuł nie przestawia przycisków filtrów
const categories = computed(() => [
  'Wszystkie',
  ...CATEGORIES.filter((category) => store.articles.some((a) => a.category === category)),
])
// Liczba artykułów w każdej dziedzinie, pokazywana przy filtrach
const categoryCount = (category: string) =>
  category === 'Wszystkie'
    ? store.articles.length
    : store.articles.filter((a) => a.category === category).length

const route = useRoute()
const router = useRouter()

function queryParam(name: string) {
  const value = route.query[name]
  return typeof value === 'string' ? value : ''
}

function updateQuery(changes: Record<string, string | undefined>) {
  router.replace({ query: { ...route.query, ...changes } })
}

// Kategoria i wyszukiwanie są trzymane w adresie, np. /?kategoria=Fizyka&q=kwant
const selected = computed({
  get: () => {
    const category = queryParam('kategoria')
    return categories.value.includes(category) ? category : 'Wszystkie'
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

  return store.articles
    .filter((a) => {
      const inCategory = selected.value === 'Wszystkie' || a.category === selected.value
      const matches = a.title.toLowerCase().includes(query)
      return inCategory && matches
    })
    .sort(sorters[sort.value])
})

function reset() {
  updateQuery({ q: undefined, kategoria: undefined })
}

const userArticles = computed(() => store.articles.filter((a) => a.author === currentUser.name))
const userLikes = computed(() => userArticles.value.reduce((sum, a) => sum + a.likes, 0))

const formOpen = ref(false)
const addButton = ref<HTMLButtonElement | null>(null)

async function closeForm() {
  formOpen.value = false
  await nextTick()
  addButton.value?.focus()
}

function publish(draft: ArticleDraft) {
  store.add(draft)
  // Nowy artykuł ma być od razu na górze, niezależnie od filtrów i sortowania
  sort.value = 'newest'
  reset()
  closeForm()
}
</script>

<template>
  <div class="board">
    <div class="top">
      <header class="board-head">
        <h1>Tablica</h1>
        <p v-if="store.articles.length" class="count">Znaleziono: {{ filtered.length }}</p>
      </header>

      <ArticleForm v-if="formOpen" @save="publish" @cancel="closeForm" />
      <button
        v-else
        ref="addButton"
        type="button"
        class="add"
        aria-label="Dodaj artykuł"
        @click="formOpen = true"
      >
        <AuthorAvatar :name="currentUser.name" />
        <span class="add-hint">Co nowego w nauce?</span>
        <span class="add-cta" aria-hidden="true">Dodaj</span>
      </button>

      <div v-if="store.articles.length" class="controls">
        <label class="search-field">
          <span class="visually-hidden">Szukaj po tytule</span>
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <input v-model="search" type="search" class="search" placeholder="Szukaj tytułu…" />
        </label>
        <label class="sort">
          <span class="visually-hidden">Sortuj</span>
          <select v-model="sort">
            <option value="newest">Najnowsze</option>
            <option value="oldest">Najstarsze</option>
            <option value="title">A–Z</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Na komputerze to menu po lewej, na telefonie przewijany rząd nad artykułami -->
    <nav v-if="store.articles.length" class="filters" aria-label="Dziedziny nauki">
      <h2 class="filters-title">Dziedziny</h2>
      <button
        v-for="category in categories"
        :key="category"
        type="button"
        :class="{ active: category === selected }"
        :aria-pressed="category === selected"
        @click="selected = category"
      >
        <span class="label">{{ category }}</span>
        <span class="n">{{ categoryCount(category) }}</span>
      </button>
    </nav>

    <div class="results">
      <div v-if="!store.articles.length" class="empty board-empty">
        <p>Tablica jest pusta. Opublikuj pierwszy artykuł przyciskiem powyżej.</p>
      </div>

      <div v-else-if="filtered.length" class="feed">
        <ArticleCard
          v-for="article in filtered"
          :key="article.id"
          :article="article"
          @delete="store.remove(article.id)"
          @like="store.toggleLike(article.id)"
        />
      </div>

      <div v-else class="empty">
        <p>Nie znaleźliśmy artykułów pasujących do wyszukiwania.</p>
        <button type="button" class="reset" @click="reset">Wyczyść filtry</button>
      </div>
    </div>

    <!-- Panele są w kodzie po tablicy, więc na telefonie to ona jest pierwsza -->
    <aside class="side">
      <UserCard :user="currentUser" :article-count="userArticles.length" :like-count="userLikes" />
      <TopLikedPanel :articles="store.topLiked" />
    </aside>
  </div>
</template>

<style scoped>
/* Telefon: jedna kolumna, najpierw tablica, a pod nią panele */
.board {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'top'
    'filters'
    'results'
    'side';
  gap: 16px 24px;
  padding-top: 28px;
}

.top {
  grid-area: top;
}

.filters {
  grid-area: filters;
}

.results {
  grid-area: results;
}

.side {
  grid-area: side;
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 8px;
}

/* Tablet: tablica i kolumna z panelami po prawej */
@media (min-width: 760px) {
  .board {
    grid-template-columns: minmax(0, 1fr) 260px;
    grid-template-rows: auto auto 1fr;
    grid-template-areas:
      'top side'
      'filters side'
      'results side';
    align-items: start;
  }

  .side {
    margin-top: 0;
  }
}

/* Komputer: dziedziny po lewej, tablica w środku, panele po prawej */
@media (min-width: 1100px) {
  .board {
    grid-template-columns: 210px minmax(0, 1fr) 260px;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      'filters top side'
      'filters results side';
  }

  .filters,
  .side {
    position: sticky;
    top: 100px;
  }
}

/* Elementy górnej części mają jeden wspólny odstęp zamiast osobnych marginesów */
.top {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.top > .article-form {
  margin-bottom: 0;
}

.board-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

h1 {
  margin: 0;
  font-size: 2rem;
}

.count {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.95rem;
}

/* Pole w stylu „napisz post”: od razu widać, kto publikuje i co się stanie */
.add {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 12px 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text-muted);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.add:hover {
  border-color: var(--color-primary-border);
  box-shadow: 0 6px 18px rgba(120, 81, 169, 0.12);
}

.add-hint {
  flex: 1;
  min-width: 0;
}

.add-cta {
  flex-shrink: 0;
  padding: 10px 20px;
  border-radius: 10px;
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-weight: 700;
  transition: background 0.2s;
}

.add:hover .add-cta {
  background: var(--color-accent-hover);
}

/* Gdy brakuje miejsca, sortowanie przechodzi pod wyszukiwarkę */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-field {
  position: relative;
  flex: 1 1 170px;
  min-width: 0;
}

.search-field svg {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  fill: none;
  stroke: var(--color-text-muted);
  stroke-width: 2;
  stroke-linecap: round;
  pointer-events: none;
}

.search {
  width: 100%;
  padding: 12px 10px 12px 42px;
  border: 1px solid var(--color-input-border);
  border-radius: 12px;
  background: var(--color-surface);
  transition: border-color 0.2s;
}

.search:focus,
.sort select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.sort select {
  width: 100%;
  height: 100%;
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid var(--color-input-border);
  border-radius: 12px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filters-title {
  display: none;
}

.filters button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text-soft);
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.filters button:hover {
  background: var(--color-primary-light);
}

.filters button.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #fff;
}

.n {
  min-width: 22px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 22px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.active .n {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

/* Na telefonie dziedziny są jednym przewijanym rzędem zamiast kilku wierszy */
@media (max-width: 759px) {
  .filters {
    flex-wrap: nowrap;
    margin-inline: -20px;
    padding: 2px 20px 4px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .filters::-webkit-scrollbar {
    display: none;
  }

  .add-hint {
    font-size: 0.95rem;
  }
}

/* Na komputerze dziedziny są pionowym menu z liczbą artykułów */
@media (min-width: 1100px) {
  .filters {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 2px;
    padding: 16px 12px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
  }

  .filters-title {
    display: block;
    margin: 0 8px 8px;
    font-size: 1.15rem;
  }

  .filters button {
    justify-content: space-between;
    padding: 9px 10px 9px 12px;
    border: none;
    border-radius: 10px;
    background: none;
    text-align: left;
  }

  .filters button.active {
    background: var(--color-primary-light);
    color: var(--color-primary);
    font-weight: 700;
    box-shadow: inset 3px 0 0 var(--color-primary);
  }

  .active .n {
    background: var(--color-primary);
    color: #fff;
  }
}

.feed {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.board-empty p {
  margin: 0;
}

.reset {
  padding: 10px 22px;
  border: none;
  border-radius: 10px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
</style>
