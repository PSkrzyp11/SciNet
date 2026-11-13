<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ArticleCard from '@/components/ArticleCard.vue'
import ArticleForm from '@/components/ArticleForm.vue'
import AuthorAvatar from '@/components/AuthorAvatar.vue'
import TopLikedPanel from '@/components/TopLikedPanel.vue'
import UserCard from '@/components/UserCard.vue'
import { useToast } from '@/composables/useToast'
import { CATEGORIES, type Article, type ArticleDraft } from '@/data/articles'
import { currentUser } from '@/data/authors'
import { useArticlesStore } from '@/stores/articles'

const sorters = {
  newest: (a: Article, b: Article) => b.date.localeCompare(a.date),
  oldest: (a: Article, b: Article) => a.date.localeCompare(b.date),
  title: (a: Article, b: Article) => a.title.localeCompare(b.title, 'pl'),
}

const store = useArticlesStore()
const { notify } = useToast()

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
const heroElement = ref<HTMLElement | null>(null)

function handleHeroPointerMove(event: PointerEvent) {
  const el = heroElement.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--hero-x', `${event.clientX - rect.left}px`)
  el.style.setProperty('--hero-y', `${event.clientY - rect.top}px`)
}

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
  notify('Artykuł został opublikowany', {
    description: `„${draft.title}” jest już widoczny na tablicy.`,
    variant: 'success',
  })
}

function handleRemove(id: number, title: string) {
  store.remove(id)
  notify('Usunięto artykuł', {
    description: `„${title}” został trwale usunięty.`,
    variant: 'info',
  })
}
</script>

<template>
  <div class="board">
    <div class="top">
      <header ref="heroElement" class="board-head" @pointermove="handleHeroPointerMove">
        <svg class="hero-ornament" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="85" />
          <circle cx="100" cy="100" r="55" stroke-dasharray="3 6" />
          <ellipse cx="100" cy="100" rx="85" ry="32" transform="rotate(-28 100 100)" />
        </svg>
        <div class="hero-copy">
          <span class="hero-kicker">Magazyn społeczności naukowej</span>
          <div class="hero-title-row">
            <h1>Tablica</h1>
            <p v-if="store.articles.length" class="count" aria-live="polite">
              Znaleziono: {{ filtered.length }}
            </p>
          </div>
          <p class="hero-sub">
            Najciekawsze odkrycia, analizy i eksperymenty opisane przystępnym językiem.
          </p>
        </div>
      </header>

      <Transition name="composer" mode="out-in">
        <ArticleForm v-if="formOpen" @save="publish" @cancel="closeForm" />
        <button v-else ref="addButton" type="button" class="add" @click="formOpen = true">
          <AuthorAvatar :name="currentUser.name" />
          <span class="add-hint">Co nowego w nauce? Podziel się odkryciem…</span>
          <span class="add-cta">Dodaj artykuł</span>
        </button>
      </Transition>

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
      <h2 class="visually-hidden">Artykuły</h2>
      <div v-if="!store.articles.length" class="empty board-empty">
        <svg class="empty-art" viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
          <circle cx="32" cy="32" r="26" stroke-dasharray="4 4" />
          <path d="M22 42l20-20M28 22h14v14" />
        </svg>
        <p>Tablica jest pusta. Opublikuj pierwszy artykuł przyciskiem powyżej.</p>
      </div>

      <TransitionGroup v-else-if="filtered.length" name="feed-list" tag="div" class="feed">
        <ArticleCard
          v-for="(article, index) in filtered"
          :key="article.id"
          :article="article"
          class="stagger-item"
          :style="{ '--stagger': index }"
          @delete="handleRemove(article.id, article.title)"
          @like="store.toggleLike(article.id)"
        />
      </TransitionGroup>

      <div v-else class="empty">
        <svg class="empty-art" viewBox="0 0 64 64" width="56" height="56" aria-hidden="true">
          <circle cx="28" cy="28" r="16" />
          <path d="M40 40l14 14M22 28h12" />
        </svg>
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
  gap: var(--space-5) var(--space-6);
  padding-top: var(--space-7);
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
  gap: var(--space-6);
  margin-top: var(--space-2);
}

/* Tablet: tablica i kolumna z panelami po prawej */
@media (min-width: 760px) {
  .board {
    grid-template-columns: minmax(0, 1fr) 270px;
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

/* Komputer: dziedziny przy lewej krawędzi, panele przy prawej, tablica pośrodku */
@media (min-width: 1100px) {
  .board {
    grid-template-columns: 236px minmax(0, 1fr) 290px;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      'filters top side'
      'filters results side';
    column-gap: var(--space-7);
    padding-inline: var(--space-3);
  }

  /* Na bardzo szerokich ekranach artykuły nie rozciągają się ponad wygodną szerokość */
  .top,
  .results {
    justify-self: center;
    width: 100%;
    max-width: 760px;
  }

  .filters,
  .side {
    position: sticky;
    top: 92px;
  }
}

/* Elementy górnej części mają jeden wspólny odstęp zamiast osobnych marginesów */
.top {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.top > .article-form {
  margin-bottom: 0;
}

/* Redakcyjny baner Hero ze światłem podążającym za kursorem i ornamentem orbitalnym */
.board-head {
  position: relative;
  overflow: hidden;
  padding: var(--space-6);
  background:
    radial-gradient(
      360px circle at var(--hero-x, 85%) var(--hero-y, 20%),
      rgba(240, 180, 41, 0.22),
      transparent 60%
    ),
    radial-gradient(circle at 12% 88%, rgba(99, 54, 158, 0.12), transparent 55%),
    var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
}

.hero-ornament {
  position: absolute;
  top: -36px;
  right: -28px;
  width: 180px;
  height: 180px;
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 1.2;
  opacity: 0.12;
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.hero-kicker {
  align-self: flex-start;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--color-primary);
  animation: hero-rise var(--duration-slow) var(--ease-out) both;
}

.hero-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  animation: hero-rise var(--duration-slow) var(--ease-out) 60ms both;
}

h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  letter-spacing: var(--tracking-tight);
}

.count {
  margin: 0;
  padding: 3px 11px;
  border-radius: var(--radius-pill);
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary-border);
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.hero-sub {
  margin: 2px 0 0;
  max-width: 580px;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: 1.5;
  animation: hero-rise var(--duration-slow) var(--ease-out) 120ms both;
}

@keyframes hero-rise {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pole w stylu „napisz post”: od razu widać, kto publikuje i co się stanie */
.add {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: 12px 14px 12px 16px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow-xs);
  color: var(--color-text-muted);
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.add:hover {
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.add:active {
  transform: scale(0.99);
}

.add-hint {
  flex: 1;
  min-width: 0;
  font-weight: 500;
}

.add-cta {
  flex-shrink: 0;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-size: var(--text-sm);
  font-weight: 700;
  box-shadow: var(--shadow-xs);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.add:hover .add-cta {
  background: var(--color-accent-hover);
  transform: translateX(2px);
}

.composer-enter-active,
.composer-leave-active {
  transition:
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}

.composer-enter-from,
.composer-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.99);
}

/* Gdy brakuje miejsca, sortowanie przechodzi pod wyszukiwarkę */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.search-field {
  position: relative;
  flex: 1 1 200px;
  min-width: 0;
}

.search-field svg {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  fill: none;
  stroke: var(--color-text-muted);
  stroke-width: 2;
  stroke-linecap: round;
  pointer-events: none;
  transition: stroke var(--duration-fast) var(--ease-out);
}

.search-field:focus-within svg {
  stroke: var(--color-primary);
}

.search {
  width: 100%;
  padding: 12px 14px 12px 44px;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  font-size: var(--text-base);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.search:hover:not(:focus),
.sort select:hover:not(:focus) {
  border-color: var(--color-primary);
}

.search:focus,
.sort select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

.sort select {
  width: 100%;
  height: 100%;
  min-height: 48px;
  padding: 0 16px;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.filters-title {
  display: none;
  font-family: var(--font-display);
}

.filters button {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: var(--space-2);
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-text-soft);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.filters button:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
}

.filters button:active {
  transform: scale(0.97);
}

.filters button.active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
}

.n {
  min-width: 22px;
  padding: 0 7px;
  border-radius: var(--radius-pill);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 22px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.active .n {
  background: rgba(255, 255, 255, 0.22);
  color: inherit;
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

  .add {
    padding: 10px 12px;
    gap: var(--space-2);
  }

  .add-hint {
    font-size: var(--text-sm);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .add-cta {
    padding: 8px 14px;
    font-size: var(--text-xs);
  }
}

/* Na komputerze dziedziny są pionowym menu z liczbą artykułów */
@media (min-width: 1100px) {
  .filters {
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 4px;
    padding: var(--space-5) var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-xs);
  }

  .filters-title {
    display: block;
    margin: 0 var(--space-2) var(--space-2);
    font-size: 1.15rem;
  }

  .filters button {
    justify-content: space-between;
    padding: 9px 10px 9px 14px;
    border: none;
    border-radius: var(--radius-sm);
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
    color: var(--color-on-primary);
  }
}

.feed {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Sekwencyjne wejście kart na tablicy (stagger) */
.stagger-item {
  animation: card-stagger var(--duration-slow) var(--ease-out) both;
  animation-delay: calc(min(var(--stagger, 0), 6) * 55ms);
}

@keyframes card-stagger {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feed-list-move,
.feed-list-enter-active,
.feed-list-leave-active {
  transition:
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}

.feed-list-enter-from,
.feed-list-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.985);
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
  fill: none;
  stroke: var(--color-primary);
  stroke-width: 1.75;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.75;
}

.empty p {
  margin: 0;
  max-width: 420px;
}

.reset {
  margin-top: var(--space-2);
  padding: 11px 24px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-xs);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.reset:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.reset:active {
  transform: scale(0.97);
}
</style>
