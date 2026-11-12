<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ArticleForm from '@/components/ArticleForm.vue'
import { useToast } from '@/composables/useToast'
import type { ArticleDraft } from '@/data/articles'
import { useArticlesStore } from '@/stores/articles'

const props = defineProps<{ id: string }>()

const store = useArticlesStore()
const router = useRouter()
const { notify } = useToast()

const articleId = computed(() => Number(props.id))
const article = computed(() => store.articles.find((a) => a.id === articleId.value))
const articlePath = computed(() => `/artykuly/${props.id}`)

// Replace zamiast push: przycisk „wstecz” nie wraca do zamkniętego formularza
function backToArticle() {
  router.replace(articlePath.value)
}

function save(draft: ArticleDraft) {
  store.update(articleId.value, draft)
  notify('Zapisano zmiany w artykule', {
    description: `„${draft.title}” został zaktualizowany.`,
    variant: 'success',
  })
  backToArticle()
}
</script>

<template>
  <div v-if="article" class="edit">
    <RouterLink :to="articlePath" class="back">← Wróć do artykułu</RouterLink>
    <span class="eyebrow">Warsztat Redakcyjny</span>
    <h1>Edycja artykułu</h1>
    <ArticleForm :initial="article" @save="save" @cancel="backToArticle" />
  </div>

  <div v-else class="not-found">
    <h1>Nie ma takiego artykułu</h1>
    <p class="lead">Mógł zostać usunięty albo link jest nieprawidłowy.</p>
    <RouterLink to="/" class="back-btn">← Wróć na tablicę</RouterLink>
  </div>
</template>

<style scoped>
.edit {
  max-width: var(--reading-width);
  margin: 0 auto;
  padding-top: var(--space-8);
}

.back {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin-bottom: var(--space-5);
  padding: 6px 12px;
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

.eyebrow {
  display: block;
  margin-bottom: 4px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--color-primary);
}

h1 {
  margin: 0 0 var(--space-6);
}

.not-found {
  max-width: 540px;
  margin: var(--space-9) auto 0;
  padding: var(--space-8) var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  text-align: center;
}

.not-found h1 {
  margin-bottom: var(--space-3);
}

.not-found .lead {
  margin: 0 auto var(--space-6);
}

.back-btn {
  display: inline-flex;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
  text-decoration: none;
}
</style>
