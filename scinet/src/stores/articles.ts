import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  CATEGORIES,
  seedArticles,
  type Article,
  type ArticleComment,
  type ArticleDraft,
} from '@/data/articles'

const STORAGE_KEY = 'scinet-articles'
const TOP_LIKED_COUNT = 5

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

function isComment(value: unknown): value is ArticleComment {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.author === 'string' &&
    typeof value.text === 'string' &&
    typeof value.date === 'string'
  )
}

function isArticle(value: unknown): value is Article {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.title === 'string' &&
    typeof value.author === 'string' &&
    CATEGORIES.some((category) => category === value.category) &&
    typeof value.date === 'string' &&
    Array.isArray(value.content) &&
    value.content.every((paragraph) => typeof paragraph === 'string') &&
    (value.image === undefined || typeof value.image === 'string') &&
    typeof value.likes === 'number' &&
    typeof value.liked === 'boolean' &&
    Array.isArray(value.comments) &&
    value.comments.every(isComment)
  )
}

// localStorage może być niedostępny albo zawierać uszkodzone dane
function load(): Article[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    // Przykładowe artykuły tylko przy pierwszym uruchomieniu: usunięte nie mogą wrócić
    if (saved === null) return seedArticles

    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed.filter(isArticle) : seedArticles
  } catch {
    return seedArticles
  }
}

function save(articles: Article[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
  } catch {
    // Bez zapisu artykuły działają do odświeżenia strony
  }
}

export const useArticlesStore = defineStore('articles', () => {
  const articles = ref<Article[]>(load())

  // Każda zmiana musi podmienić całą tablicę, bo tylko wtedy watch ją zauważy
  watch(articles, save)

  // Przy równej liczbie polubień wyżej jest nowszy artykuł
  const topLiked = computed(() =>
    articles.value
      .filter((article) => article.likes > 0)
      .sort((a, b) => b.likes - a.likes || b.date.localeCompare(a.date))
      .slice(0, TOP_LIKED_COUNT),
  )

  function add(draft: ArticleDraft) {
    const article: Article = {
      ...draft,
      // Czas się nie powtarza, więc nowy artykuł nie przejmie zakładki po usuniętym
      id: Date.now(),
      date: new Date().toISOString(),
      likes: 0,
      liked: false,
      comments: [],
    }
    articles.value = [article, ...articles.value]
  }

  // Formularz zmienia tylko swoje pola: data, polubienia i komentarze zostają.
  // Szkic bez obrazka oznacza jego usunięcie, dlatego image jest podane wprost.
  function update(id: number, draft: ArticleDraft) {
    articles.value = articles.value.map((article) =>
      article.id === id ? { ...article, ...draft, image: draft.image } : article,
    )
  }

  function remove(id: number) {
    articles.value = articles.value.filter((article) => article.id !== id)
  }

  // Jak w serwisach społecznościowych: drugie kliknięcie cofa polubienie
  function toggleLike(id: number) {
    articles.value = articles.value.map((article) =>
      article.id === id
        ? {
            ...article,
            liked: !article.liked,
            likes: article.likes + (article.liked ? -1 : 1),
          }
        : article,
    )
  }

  return { articles, topLiked, add, update, remove, toggleLike }
})
