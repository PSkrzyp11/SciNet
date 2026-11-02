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
    <h2>Najnowsze</h2>
    <div class="grid">
      <ArticleCard v-for="article in latest" :key="article.id" :article="article" />
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 56px 0 40px;
  text-align: center;
}

.hero h1 {
  margin: 0 0 12px;
  font-size: clamp(2rem, 5vw, 3rem);
  color: #1f2937;
}

.hero h1 span {
  color: #4f46e5;
}

.hero p {
  max-width: 520px;
  margin: 0 auto 28px;
  color: #6b7280;
  font-size: 1.1rem;
  line-height: 1.6;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 10px;
  background: #4f46e5;
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.btn:hover {
  background: #4338ca;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 48px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.stat strong {
  font-size: 1.6rem;
  color: #4f46e5;
}

.stat span {
  color: #6b7280;
  font-size: 0.9rem;
}

h2 {
  margin: 0 0 16px;
  color: #1f2937;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}
</style>
