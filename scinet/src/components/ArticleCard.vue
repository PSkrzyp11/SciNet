<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import ArticleImage from '@/components/ArticleImage.vue'
import AuthorAvatar from '@/components/AuthorAvatar.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import LikeButton from '@/components/LikeButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { readingTime, type Article } from '@/data/articles'

const props = defineProps<{ article: Article }>()

// Karta tylko zgłasza zdarzenia, a dane w store zmienia rodzic
const emit = defineEmits<{ delete: []; like: [] }>()

const formatDate = (date: string) => new Date(date).toLocaleDateString('pl-PL')

// Efekt subtelnego podświetlenia (spotlight) podążającego za kursorem
const cardElement = ref<HTMLElement | null>(null)

function handlePointerMove(event: PointerEvent) {
  const el = cardElement.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`)
  el.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`)
}

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
  <article ref="cardElement" class="card" @pointermove="handlePointerMove">
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
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            Edytuj
          </RouterLink>
          <button type="button" class="menu-item delete" @click="confirmDelete">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M3 6h18M8 6V4h8v2m-9 0l1 14h8l1-14" />
            </svg>
            Usuń
          </button>
        </div>
      </div>
    </header>

    <div class="card-body">
      <BaseBadge class="category" :category="article.category" />
      <h3>
        <RouterLink :to="`/artykuly/${article.id}`" class="title">{{ article.title }}</RouterLink>
      </h3>
      <p class="text">{{ article.content.join(' ') }}</p>
    </div>

    <div v-if="article.image" class="media-wrap">
      <ArticleImage :src="article.image" :alt="article.title" />
    </div>

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
  gap: var(--space-4);
  padding: var(--space-6);
  background:
    radial-gradient(
      420px circle at var(--mouse-x, 50%) var(--mouse-y, 0%),
      var(--color-primary-subtle),
      transparent 65%
    ),
    var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
  /* Długi tekst bez spacji wpisany w formularzu nie rozpycha strony */
  overflow-wrap: anywhere;
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out),
    background-color var(--duration-normal) var(--ease-out);
}

/* Subtelny pasek akcentowy odsłaniający się na hoverze */
.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--space-6);
  right: var(--space-6);
  height: 2px;
  border-radius: var(--radius-pill);
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  opacity: 0;
  transform: scaleX(0.6);
  transition:
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-out);
}

.card:hover {
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.card:hover::before {
  opacity: 1;
  transform: scaleX(1);
}

@media (max-width: 560px) {
  .card {
    padding: var(--space-5);
  }
}

.head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
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
  color: var(--color-text);
}

.meta {
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

/* Menu i przyciski leżą nad linkiem rozciągniętym na całą kartę */
.menu {
  position: relative;
  z-index: var(--z-dropdown);
  align-self: flex-start;
}

.icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.icon-action:hover,
.icon-action[aria-expanded='true'] {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.icon-action:active {
  transform: scale(0.92);
}

.icon-action svg {
  fill: currentColor;
}

.menu-list {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-05);
  min-width: 164px;
  padding: var(--space-15);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  animation: menu-pop var(--duration-fast) var(--ease-spring);
  transform-origin: top right;
}

@keyframes menu-pop {
  from {
    opacity: 0;
    transform: scale(0.94) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-25) var(--space-3);
  border: none;
  border-radius: var(--radius-xs);
  background: none;
  color: var(--color-text);
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.menu-item svg {
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.menu-item:hover,
.menu-item:focus-visible {
  background: var(--color-primary-light);
}

.menu-item.delete {
  color: var(--color-error);
}

.menu-item.delete:hover,
.menu-item.delete:focus-visible {
  background: var(--color-error-bg);
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

.card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.category {
  align-self: flex-start;
}

h3 {
  margin: var(--space-05) 0 0;
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 650;
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-snug);
}

.title {
  color: inherit;
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-out);
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
  margin: var(--space-05) 0 0;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  line-clamp: 4;
}

.media-wrap {
  overflow: hidden;
  border-radius: var(--radius-md);
}

.card:hover .media-wrap :deep(.article-image) {
  transform: scale(1.025);
}

.bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-4);
  margin-top: var(--space-05);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
}

.save {
  margin-left: auto;
}

.comment-count {
  display: inline-flex;
  align-items: center;
  gap: var(--space-15);
  padding: var(--space-15) var(--space-25);
  border-radius: var(--radius-pill);
  background: var(--color-bg-subtle);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
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
