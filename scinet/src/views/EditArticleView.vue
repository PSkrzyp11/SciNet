<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ArticleForm from '@/components/ArticleForm.vue'
import type { ArticleDraft } from '@/data/articles'
import { useArticlesStore } from '@/stores/articles'

const props = defineProps<{ id: string }>()

const store = useArticlesStore()
const router = useRouter()

const articleId = computed(() => Number(props.id))
const article = computed(() => store.articles.find((a) => a.id === articleId.value))
const articlePath = computed(() => `/artykuly/${props.id}`)

// Replace zamiast push: przycisk „wstecz” nie wraca do zamkniętego formularza
function backToArticle() {
  router.replace(articlePath.value)
}

function save(draft: ArticleDraft) {
  store.update(articleId.value, draft)
  backToArticle()
}
</script>

<template>
  <div v-if="article" class="edit">
    <RouterLink :to="articlePath" class="back">← Wróć do artykułu</RouterLink>
    <h1>Edycja artykułu</h1>
    <ArticleForm :initial="article" @save="save" @cancel="backToArticle" />
  </div>

  <div v-else class="not-found">
    <h1>Nie ma takiego artykułu</h1>
    <p class="lead">Mógł zostać usunięty albo link jest nieprawidłowy.</p>
    <RouterLink to="/">← Wróć na tablicę</RouterLink>
  </div>
</template>

<style scoped>
.edit {
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

h1 {
  margin: 0 0 24px;
}

.not-found {
  padding-top: 40px;
  text-align: center;
}

.not-found h1 {
  margin-bottom: 12px;
}

.not-found .lead {
  margin: 0 auto 24px;
}
</style>
