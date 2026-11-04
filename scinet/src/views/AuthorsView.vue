<script setup lang="ts">
import { computed } from 'vue'
import { authors, initials, type Author } from '@/data/authors'
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
      color: 'var(--color-button)',
      bio: '',
    })),
  ]
})
</script>

<template>
  <h1>Autorzy</h1>
  <p class="lead">Poznaj osoby, które piszą dla SciNet, i zobacz, o czym piszą.</p>

  <div class="grid">
    <div v-for="author in allAuthors" :key="author.name" class="author">
      <div class="head">
        <div class="avatar" :style="{ background: author.color }">
          {{ initials(author.name) }}
        </div>
        <div>
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
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(420px, 1fr));
  gap: 24px;
}

@media (max-width: 500px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.author {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.head {
  display: flex;
  align-items: center;
  gap: 18px;
}

.avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  color: #fff;
  font-size: 1.5rem;
  font-weight: 700;
}

h3 {
  margin: 0 0 2px;
  font-size: 1.35rem;
}

.field {
  color: var(--color-text-muted);
}

.bio {
  margin: 0;
  flex: 1;
}

.written {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.written strong {
  font-size: 0.95rem;
}

.written ul {
  margin: 8px 0 0;
  padding-left: 20px;
}

.written li + li {
  margin-top: 4px;
}

.written a {
  text-decoration: none;
  font-weight: 500;
}

.written a:hover {
  text-decoration: underline;
}
</style>
