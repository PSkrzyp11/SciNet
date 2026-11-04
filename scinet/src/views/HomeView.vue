<script setup lang="ts">
import ArticleCard from '@/components/ArticleCard.vue'
import { articles } from '@/data/articles'
import { authors } from '@/data/authors'

const latest = articles.slice(0, 3)

// Polska odmiana: 1 artykuł, 2 artykuły, 5 artykułów
function plural(count: number, one: string, few: string, many: string) {
  if (count === 1) return one
  const lastDigit = count % 10
  const lastTwo = count % 100
  return lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14) ? few : many
}

const categoryCount = new Set(articles.map((a) => a.category)).size

const stats = [
  {
    value: articles.length,
    label: plural(articles.length, 'artykuł', 'artykuły', 'artykułów'),
  },
  {
    value: authors.length,
    label: plural(authors.length, 'autor', 'autorzy', 'autorów'),
  },
  {
    value: categoryCount,
    label: plural(categoryCount, 'dziedzina nauki', 'dziedziny nauki', 'dziedzin nauki'),
  },
]
</script>

<template>
  <section class="hero">
    <h1>Nauka podana <span>po ludzku</span></h1>
    <p>Artykuły, ciekawostki i odkrycia ze świata nauki pisane przez pasjonatów.</p>
    <RouterLink to="/artykuly" class="btn">Czytaj artykuły</RouterLink>
  </section>

  <section class="stats">
    <div v-for="stat in stats" :key="stat.label" class="stat">
      <strong>{{ stat.value }}</strong>
      <span>{{ stat.label }}</span>
    </div>
  </section>

  <section>
    <div class="section-head">
      <h2>Najnowsze</h2>
      <RouterLink to="/artykuly">Wszystkie artykuły →</RouterLink>
    </div>
    <div class="grid">
      <ArticleCard v-for="article in latest" :key="article.id" :article="article" />
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 48px 0 36px;
  text-align: center;
}

.hero h1 {
  margin: 0 0 12px;
  font-size: clamp(2.4rem, 6vw, 3.6rem);
}

.hero h1 span {
  color: var(--color-primary);
}

.hero p {
  max-width: 600px;
  margin: 0 auto 24px;
  color: var(--color-text-muted);
  font-size: 1.25rem;
}

.btn {
  display: inline-block;
  padding: 16px 32px;
  border-radius: 12px;
  background: var(--color-button);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.btn:hover {
  background: var(--color-button-hover);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 44px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.stat strong {
  font-size: 2.2rem;
  line-height: 1.2;
  color: var(--color-primary);
}

.stat span {
  color: var(--color-text-muted);
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.section-head h2 {
  margin: 0;
}

.section-head a {
  font-weight: 600;
  text-decoration: none;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}
</style>
