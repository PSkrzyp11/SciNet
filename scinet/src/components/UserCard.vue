<script setup lang="ts">
import AuthorAvatar from '@/components/AuthorAvatar.vue'
import type { Author } from '@/data/authors'

defineProps<{ user: Author; articleCount: number; likeCount: number }>()
</script>

<template>
  <section class="user-card" aria-label="Wizytówka użytkownika">
    <AuthorAvatar class="photo" :name="user.name" :size="68" />
    <h2>{{ user.name }}</h2>
    <p class="field">{{ user.field }}</p>
    <p class="bio">{{ user.bio }}</p>
    <dl>
      <div>
        <dt>Artykuły</dt>
        <dd>{{ articleCount }}</dd>
      </div>
      <div>
        <dt>Polubienia</dt>
        <dd>{{ likeCount }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.user-card {
  padding: 24px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  text-align: center;
}

.photo {
  margin-bottom: 12px;
}

h2 {
  margin: 0;
  font-size: 1.15rem;
}

.field {
  margin: 2px 0 12px;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.bio {
  margin: 0 0 16px;
  font-size: 0.9rem;
  line-height: 1.5;
}

dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

dt {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

dd {
  margin: 0;
  color: var(--color-primary);
  font-size: 1.3rem;
  font-weight: 700;
}
</style>
