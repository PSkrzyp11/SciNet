<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import ArticleImage from '@/components/ArticleImage.vue'
import AuthorAvatar from '@/components/AuthorAvatar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import CommentSection from '@/components/CommentSection.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import LikeButton from '@/components/LikeButton.vue'
import SplitHeading from '@/components/SplitHeading.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useToast } from '@/composables/useToast'
import { readingTime } from '@/data/articles'
import { useArticlesStore } from '@/stores/articles'

const props = defineProps<{ id: string }>()

const store = useArticlesStore()
const { notify } = useToast()

const article = computed(() => store.articles.find((a) => a.id === Number(props.id)))

const related = computed(() =>
  store.articles.filter((a) => a.id !== article.value?.id && a.author === article.value?.author),
)

// Pasek postępu czytania na górze ekranu
const readProgress = ref(0)

function updateProgress() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
  readProgress.value = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
}

async function copyArticleLink() {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href)
    }
  } catch {
    // Nawet bez dostępu do schowka pokazujemy potwierdzenie akcji
  }
  notify('Skopiowano link do artykułu', {
    description: 'Możesz teraz udostępnić ten tekst dalej.',
    variant: 'info',
    duration: 2400,
  })
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  updateProgress()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<template>
  <article v-if="article" class="article">
    <div class="progress-track" aria-hidden="true">
      <div class="progress-bar" :style="{ transform: `scaleX(${readProgress / 100})` }"></div>
    </div>

    <header class="article-head">
      <RouterLink to="/" class="back">← Wróć na tablicę</RouterLink>

      <div class="top">
        <BaseBadge class="category" :category="article.category" />
        <div class="actions">
          <LikeButton
            :count="article.likes"
            :liked="article.liked"
            @toggle="store.toggleLike(article.id)"
          />
          <FavoriteButton :article-id="article.id" with-label />
          <BaseButton
            variant="secondary"
            size="sm"
            class="share"
            title="Kopiuj link"
            @click="copyArticleLink"
          >
            Udostępnij
          </BaseButton>
          <BaseButton
            :to="`/artykuly/${article.id}/edytuj`"
            variant="secondary"
            size="sm"
            class="edit"
          >
            Edytuj
          </BaseButton>
        </div>
      </div>

      <SplitHeading class="article-title" :text="article.title" />

      <div class="meta">
        <AuthorAvatar :name="article.author" :size="36" />
        <span class="meta-author">{{ article.author }}</span>
        <span aria-hidden="true">·</span>
        <span class="meta-mono">{{ new Date(article.date).toLocaleDateString('pl-PL') }}</span>
        <span aria-hidden="true">·</span>
        <span class="meta-mono">{{ readingTime(article) }} min czytania</span>
      </div>
    </header>

    <ArticleImage class="image" :src="article.image" :alt="article.title" eager />

    <p v-for="(paragraph, i) in article.content" :key="i">{{ paragraph }}</p>

    <CommentSection :comments="article.comments" @add="store.addComment(article.id, $event)" />

    <aside v-if="related.length" class="related">
      <span class="related-eyebrow">Polecane lektury</span>
      <h2>Więcej od autora</h2>
      <ul>
        <li v-for="item in related" :key="item.id">
          <RouterLink :to="`/artykuly/${item.id}`">
            <span class="related-title">{{ item.title }}</span>
            <span class="related-meta" aria-hidden="true">
              {{ item.category }} · {{ readingTime(item) }} min →
            </span>
          </RouterLink>
        </li>
      </ul>
    </aside>
  </article>

  <div v-else class="not-found">
    <span class="not-found-badge" aria-hidden="true">Brak publikacji</span>
    <h1>Nie ma takiego artykułu</h1>
    <p class="lead">Mógł zostać usunięty albo link jest nieprawidłowy.</p>
    <BaseButton to="/" class="back-btn">← Wróć na tablicę</BaseButton>
  </div>
</template>

<style scoped>
/* Siatka 12 kolumn: nagłówek na całą szerokość, tekst w ośmiu środkowych kolumnach.
   Na telefonie i tablecie wszystko zajmuje pełną szerokość. */
.article {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr));
  column-gap: var(--grid-gap);
  padding-top: var(--space-8);
  /* Długi tekst bez spacji wpisany w formularzu nie rozpycha strony */
  overflow-wrap: anywhere;
}

.article > * {
  grid-column: 1 / -1;
}

.article-head {
  display: grid;
  grid-template-columns: subgrid;
}

.article-head > * {
  grid-column: 1 / -1;
}

@media (min-width: 960px) {
  .article > :not(.article-head) {
    grid-column: 3 / 11;
  }

  .article-head .article-title {
    grid-column: 1 / 11;
  }
}

.progress-track {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-progress);
  height: 3px;
  background: transparent;
  pointer-events: none;
}

.progress-bar {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  transform-origin: left center;
  transition: transform var(--duration-instant) linear;
}

.back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-15);
  width: fit-content;
  margin-bottom: var(--space-5);
  padding: var(--space-15) var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--color-bg-subtle);
  color: var(--color-text-soft);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.back:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  transform: translateX(-2px);
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

h1 {
  margin: var(--space-4) 0 var(--space-4);
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  line-height: 1.15;
  letter-spacing: var(--tracking-tight);
}

/* Tytuł artykułu: duży krój Archivo, linie wysuwają się zza maski */
.article-title {
  margin: var(--space-6) 0 var(--space-6);
  font-size: clamp(2.1rem, 1.25rem + 3.4vw, 4.5rem);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.03em;
  text-wrap: balance;
}

.meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-7);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.meta-author {
  color: var(--color-text);
  font-weight: 600;
}

.meta-mono {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

p {
  margin: 0 0 var(--space-5);
  font-size: var(--text-md);
  line-height: var(--leading-relaxed);
  color: var(--color-text);
  /* Pojedynczy Enter wpisany w formularzu jest nową linią w akapicie */
  white-space: pre-line;
}

.image {
  margin-bottom: var(--space-7);
  box-shadow: var(--shadow-sm);
}

/* Pierwszy akapit jest wprowadzeniem do tekstu (lead redakcyjny) */
.article > p:first-of-type {
  padding-left: var(--space-5);
  border-left: 3px solid var(--color-accent);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 500;
  line-height: 1.6;
  color: var(--color-text-soft);
}

.related {
  margin-top: var(--space-9);
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
}

.related-eyebrow {
  display: block;
  margin-bottom: var(--space-1);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--color-primary);
}

.related h2 {
  margin-bottom: var(--space-4);
  font-size: var(--text-xl);
}

.related ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.related a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  background: var(--color-bg-subtle);
  color: var(--color-text);
  text-decoration: none;
  font-weight: 600;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.related a:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
  transform: translateX(4px);
}

.related-meta {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-muted);
}

.not-found {
  max-width: 540px;
  margin: var(--space-9) auto 0;
  padding: var(--space-8) var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
  text-align: center;
}

.not-found-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
}

.not-found .lead {
  margin: 0 auto var(--space-6);
}
</style>
