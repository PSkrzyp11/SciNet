<script setup lang="ts">
import { articles } from '@/data/articles'

const authors = [
  { name: 'Anna Nowak', field: 'Fizyka i astronomia', color: '#4f46e5' },
  { name: 'Marek Wiśniewski', field: 'Biologia molekularna', color: '#059669' },
  { name: 'Kasia Zielińska', field: 'Informatyka i matematyka', color: '#d97706' },
  { name: 'Tomasz Lewandowski', field: 'Ekologia', color: '#0891b2' },
]

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')

const articleCount = (name: string) => articles.filter((a) => a.author === name).length
</script>

<template>
  <h1>Autorzy</h1>

  <div class="grid">
    <div v-for="author in authors" :key="author.name" class="author">
      <div class="avatar" :style="{ background: author.color }">
        {{ initials(author.name) }}
      </div>
      <h3>{{ author.name }}</h3>
      <p>{{ author.field }}</p>
      <span class="count">Artykuły: {{ articleCount(author.name) }}</span>
    </div>
  </div>
</template>

<style scoped>
h1 {
  margin: 32px 0 20px;
  color: #1f2937;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.author {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 28px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  text-align: center;
}

.avatar {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 12px;
  border-radius: 50%;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
}

h3 {
  margin: 0 0 4px;
  color: #1f2937;
}

p {
  margin: 0 0 12px;
  color: #6b7280;
}

.count {
  font-size: 0.85rem;
  color: #4f46e5;
  font-weight: 600;
}
</style>
