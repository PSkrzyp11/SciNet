<script setup lang="ts">
import ArticleCard from '@/components/ArticleCard.vue'
import { articles } from '@/data/articles'

const latest = articles.slice(0, 3)

const stats = [
  { value: '120+', label: 'artykułów' },
  { value: '35', label: 'autorów' },
  { value: '8', label: 'dziedzin nauki' },
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
  padding: 80px 0 56px;
  text-align: center;
}

.hero h1 {
  margin: 0 0 20px;
  font-size: clamp(2.4rem, 6vw, 3.6rem);
}

.hero h1 span {
  color: var(--color-primary);
}

.hero p {
  max-width: 600px;
  margin: 0 auto 36px;
  color: var(--color-text-muted);
  font-size: 1.25rem;
}

.btn {
  display: inline-block;
  padding: 16px 32px;
  border-radius: 12px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.btn:hover {
  background: var(--color-primary-dark);
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 72px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 12px;
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
  margin-bottom: 20px;
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
