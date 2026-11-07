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
    <div class="content">
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

      <div v-if="!store.articles.length" class="empty board-empty">
        <p>Tablica jest pusta. Opublikuj pierwszy artykuł przyciskiem powyżej.</p>
      </div>

      <template v-else>
        <div class="controls">
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

        <div class="filters" role="group" aria-label="Dziedziny nauki">
          <button
            v-for="category in categories"
            :key="category"
            type="button"
            :class="{ active: category === selected }"
            :aria-pressed="category === selected"
            @click="selected = category"
          >
            {{ category }}
          </button>
        </div>

        <div v-if="filtered.length" class="feed">
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
      </template>
    </div>

    <!-- Panele są w kodzie po tablicy, więc na telefonie to ona jest pierwsza -->
    <UserCard
      class="profile"
      :user="currentUser"
      :article-count="userArticles.length"
      :like-count="userLikes"
    />
    <TopLikedPanel class="popular" :articles="store.topLiked" />
  </div>
</template>

<style scoped>
/* Telefon: jedna kolumna, najpierw tablica, a pod nią panele */
.board {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'content'
    'profile'
    'popular';
  gap: 24px;
  padding-top: 28px;
}

.content {
  grid-area: content;
}

.profile {
  grid-area: profile;
}

.popular {
  grid-area: popular;
}

/* Tablet: tablica i kolumna z panelami */
@media (min-width: 760px) {
  .board {
    grid-template-columns: 250px minmax(0, 1fr);
    grid-template-rows: auto 1fr;
    grid-template-areas:
      'profile content'
      'popular content';
    align-items: start;
  }
}

/* Komputer: panele po obu stronach tablicy, widoczne także po przewinięciu */
@media (min-width: 1100px) {
  .board {
    grid-template-columns: 240px minmax(0, 1fr) 270px;
    grid-template-rows: auto;
    grid-template-areas: 'profile content popular';
  }

  .profile,
  .popular {
    position: sticky;
    top: 100px;
  }
}

/* Elementy tablicy mają jeden wspólny odstęp zamiast osobnych marginesów */
.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content > .article-form {
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

/* Na telefonie filtry są jednym przewijanym rzędem zamiast trzech wierszy */
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

.filters button {
  flex-shrink: 0;
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
