<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import ArticleImage from '@/components/ArticleImage.vue'
import AuthorAvatar from '@/components/AuthorAvatar.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import LikeButton from '@/components/LikeButton.vue'
import { readingTime, type Article } from '@/data/articles'

const props = defineProps<{ article: Article }>()

// Karta tylko zgłasza zdarzenia, a dane w store zmienia rodzic
const emit = defineEmits<{ delete: []; like: [] }>()

const formatDate = (date: string) => new Date(date).toLocaleDateString('pl-PL')

// Edycja i usuwanie są rzadsze, więc chowają się w menu „Więcej opcji”
const menuOpen = ref(false)
const menu = ref<HTMLElement | null>(null)
const menuButton = ref<HTMLButtonElement | null>(null)

function closeMenu() {
  menuOpen.value = false
}

function closeOnOutsideClick(event: PointerEvent) {
  if (!menu.value?.contains(event.target as Node)) closeMenu()
}

function closeOnEscape() {
  closeMenu()
  menuButton.value?.focus()
}

// Nasłuch na cały dokument działa tylko wtedy, gdy menu jest otwarte
watch(menuOpen, (open) => {
  if (open) document.addEventListener('pointerdown', closeOnOutsideClick)
  else document.removeEventListener('pointerdown', closeOnOutsideClick)
})

onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOnOutsideClick))

function confirmDelete() {
  closeMenu()
  if (window.confirm(`Usunąć artykuł „${props.article.title}”? Tej operacji nie da się cofnąć.`)) {
    emit('delete')
  }
}
</script>

<template>
  <article class="card">
    <header class="head">
      <AuthorAvatar :name="article.author" />
      <div class="byline">
        <span class="author">{{ article.author }}</span>
        <span class="meta">
          <time :datetime="article.date">{{ formatDate(article.date) }}</time>
          · {{ readingTime(article) }} min czytania
        </span>
      </div>

      <div ref="menu" class="menu" @keydown.esc="closeOnEscape">
        <button
          ref="menuButton"
          type="button"
          class="icon-action menu-toggle"
          aria-label="Więcej opcji"
          title="Więcej opcji"
          :aria-expanded="menuOpen"
          @click="menuOpen = !menuOpen"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </button>
        <div v-show="menuOpen" class="menu-list">
          <RouterLink :to="`/artykuly/${article.id}/edytuj`" class="menu-item edit">
            Edytuj
          </RouterLink>
          <button type="button" class="menu-item delete" @click="confirmDelete">Usuń</button>
        </div>
      </div>
    </header>

    <span class="category">{{ article.category }}</span>
    <h3>
      <RouterLink :to="`/artykuly/${article.id}`" class="title">{{ article.title }}</RouterLink>
    </h3>
    <p class="text">{{ article.content.join(' ') }}</p>
    <ArticleImage :src="article.image" :alt="article.title" />

    <footer class="bar">
      <LikeButton :count="article.likes" :liked="article.liked" @toggle="emit('like')" />
      <span
        class="comment-count"
        role="img"
        :aria-label="`Komentarze: ${article.comments.length}`"
        :title="`Komentarze: ${article.comments.length}`"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M4 5h16v11H9l-5 4V5z" />
        </svg>
        {{ article.comments.length }}
      </span>
      <FavoriteButton class="save" :article-id="article.id" />
    </footer>
  </article>
</template>

<style scoped>
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  /* Długi tekst bez spacji wpisany w formularzu nie rozpycha strony */
  overflow-wrap: anywhere;
  transition:
    box-shadow 0.2s,
    border-color 0.2s;
}

.card:hover {
  border-color: var(--color-primary-border);
  box-shadow: 0 8px 24px rgba(120, 81, 169, 0.14);
}

@media (max-width: 560px) {
  .card {
    padding: 20px;
  }
}

.head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.byline {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  line-height: 1.35;
}

.author {
  font-weight: 600;
}

.meta {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

/* Menu i przyciski leżą nad linkiem rozciągniętym na całą kartę */
.menu {
  position: relative;
  z-index: 2;
  align-self: flex-start;
}

.icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.icon-action:hover,
.icon-action[aria-expanded='true'] {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.icon-action svg {
  fill: currentColor;
}

.menu-list {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  display: flex;
  flex-direction: column;
  min-width: 150px;
  padding: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(47, 27, 77, 0.18);
}

.menu-item {
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: none;
  color: var(--color-text);
  font-weight: 500;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.menu-item:hover,
.menu-item:focus-visible {
  background: var(--color-primary-light);
}

.menu-item.delete {
  color: var(--color-error);
}

/* Na ekranach dotykowych przyciski mają wygodne 44 px */
@media (pointer: coarse) {
  .icon-action {
    min-width: 44px;
    min-height: 44px;
  }

  .menu-item {
    min-height: 44px;
  }
}

.category {
  align-self: flex-start;
  margin-top: 4px;
  padding: 3px 12px;
  white-space: nowrap;
  border-radius: 999px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 0.8rem;
  font-weight: 600;
}

h3 {
  margin: 0;
  font-size: 1.3rem;
}

.title {
  color: inherit;
  text-decoration: none;
}

.title:hover {
  color: var(--color-primary);
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
  -webkit-line-clamp: 4;
  line-clamp: 4;
}

.bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}

.save {
  margin-left: auto;
}

.comment-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.comment-count svg {
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linejoin: round;
}
</style>
