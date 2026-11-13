<script setup lang="ts">
import { computed } from 'vue'
import AuthorAvatar from '@/components/AuthorAvatar.vue'
import { authors, type Author } from '@/data/authors'
import { useArticlesStore } from '@/stores/articles'

const store = useArticlesStore()

const articlesBy = (name: string) => store.articles.filter((a) => a.author === name)

// Autorzy z listy mają opis, a osoby wpisane w formularzu dostają kartę bez opisu
const allAuthors = computed<Author[]>(() => {
  const known = authors.map((author) => author.name)
  const others = [...new Set(store.articles.map((a) => a.author))].filter(
    (name) => !known.includes(name),
  )

  return [
    ...authors,
    ...others.map((name) => ({
      name,
      field: 'Społeczność SciNet',
      bio: '',
    })),
  ]
})
</script>

<template>
  <header class="page-head">
    <span class="eyebrow">Zespół i społeczność</span>
    <h1>Autorzy</h1>
    <p class="lead">Poznaj osoby, które piszą dla SciNet, i zobacz, o czym piszą.</p>
  </header>

  <div class="grid">
    <div
      v-for="(author, index) in allAuthors"
      :key="author.name"
      class="author"
      :style="{ '--stagger': index }"
    >
      <div class="head">
        <AuthorAvatar :name="author.name" :size="76" />
        <div class="identity">
          <h3>{{ author.name }}</h3>
          <span class="field">{{ author.field }}</span>
        </div>
      </div>

      <p v-if="author.bio" class="bio">{{ author.bio }}</p>

      <div class="written">
        <strong>Artykuły ({{ articlesBy(author.name).length }})</strong>
        <ul>
          <li v-for="article in articlesBy(author.name)" :key="article.id">
            <RouterLink :to="`/artykuly/${article.id}`">{{ article.title }}</RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-head {
  margin-top: var(--space-8);
}

.eyebrow {
  display: inline-block;
  margin-bottom: var(--space-1);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--color-primary);
}

h1 {
  margin-top: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(420px, 100%), 1fr));
  gap: var(--space-6);
}

.author {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-7);
  /* Długie imię bez spacji wpisane w formularzu nie rozpycha strony */
  overflow-wrap: anywhere;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
  animation: author-rise var(--duration-slow) var(--ease-out) both;
  animation-delay: calc(min(var(--stagger, 0), 8) * var(--stagger-step));
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out);
}

@keyframes author-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.author:hover {
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

@media (max-width: 560px) {
  .author {
    padding: var(--space-5);
  }
}

.head {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.identity {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-15);
}

h3 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-xl);
}

.field {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-pill);
  background: var(--color-primary-light);
  border: 1px solid var(--color-primary-border);
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: 600;
}

.bio {
  margin: 0;
  color: var(--color-text-soft);
  line-height: var(--leading-normal);
}

.written {
  margin-top: auto;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
}

.written strong {
  display: block;
  margin-bottom: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  color: var(--color-text-muted);
}

.written ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-15);
  margin: 0;
  padding: 0;
  list-style: none;
}

.written a {
  display: block;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-xs);
  background: var(--color-bg-subtle);
  color: var(--color-text);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 500;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.written a:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  transform: translateX(3px);
}
</style>
