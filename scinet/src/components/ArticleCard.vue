<script setup lang="ts">
import ArticleImage from '@/components/ArticleImage.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import { readingTime, type Article } from '@/data/articles'

const props = defineProps<{ article: Article }>()

// Karta tylko pyta o potwierdzenie, a samo usunięcie należy do rodzica
const emit = defineEmits<{ delete: [] }>()

function confirmDelete() {
  if (window.confirm(`Usunąć artykuł „${props.article.title}”? Tej operacji nie da się cofnąć.`)) {
    emit('delete')
  }
}
</script>

<template>
  <article class="card">
    <div class="top">
      <span class="category">{{ article.category }}</span>
      <div class="actions">
        <FavoriteButton :article-id="article.id" />
        <button
          type="button"
          class="delete"
          aria-label="Usuń artykuł"
          title="Usuń artykuł"
          @click="confirmDelete"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
          </svg>
        </button>
      </div>
    </div>
    <ArticleImage :src="article.image" :alt="article.title" />
    <h3>
      <RouterLink :to="`/artykuly/${article.id}`" class="title">{{ article.title }}</RouterLink>
    </h3>
    <p class="text">{{ article.content.join(' ') }}</p>
    <footer>
      <span>{{ article.author }}</span>
      <span>{{ new Date(article.date).toLocaleDateString('pl-PL') }}</span>
    </footer>
    <div class="bottom">
      <span class="more">Czytaj dalej →</span>
      <span class="time">{{ readingTime(article) }} min czytania</span>
    </div>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 28px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
}

.card:hover {
  transform: translateY(-3px);
  border-color: var(--color-primary);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.07);
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Przycisk leży nad linkiem rozciągniętym na całą kartę */
.delete {
  position: relative;
  z-index: 1;
  display: inline-flex;
  padding: 6px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.delete:hover {
  background: var(--color-hover);
  color: var(--color-error);
}

.delete svg {
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.category {
  padding: 3px 12px;
  border-radius: 999px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 600;
}

h3 {
  margin: 4px 0 0;
  font-size: 1.3rem;
}

.title {
  color: inherit;
  text-decoration: none;
}

/* Tytuł jest linkiem, a ta warstwa rozciąga go na całą kartę */
.title::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
}

/* Na karcie tylko początek treści, całość jest na stronie artykułu */
.text {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--color-text-muted);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  line-clamp: 5;
}

footer {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.bottom {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.time {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.more {
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.95rem;
}
</style>
