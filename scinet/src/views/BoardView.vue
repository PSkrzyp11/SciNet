<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import ArticleForm from '@/components/ArticleForm.vue'
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
      <h1>Tablica</h1>

      <ArticleForm v-if="formOpen" @publish="publish" @cancel="closeForm" />
      <button v-else ref="addButton" type="button" class="add" @click="formOpen = true">
        Dodaj artykuł
      </button>

      <div v-if="!store.articles.length" class="empty board-empty">
        <p>Tablica jest pusta. Opublikuj pierwszy artykuł przyciskiem powyżej.</p>
      </div>

      <template v-else>
        <input v-model="search" type="search" class="search" placeholder="Szukaj po tytule…" />

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
          <button class="reset" @click="reset">Wyczyść filtry</button>
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
  padding-top: 32px;
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

h1 {
  margin: 0 0 28px;
  text-align: center;
}

.add {
  display: block;
  margin: 0 auto 24px;
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  background: var(--color-button);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.add:hover {
  background: var(--color-button-hover);
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

.feed {
  display: flex;
  flex-direction: column;
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

.board-empty p {
  margin: 0;
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
