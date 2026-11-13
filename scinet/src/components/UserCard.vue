<script setup lang="ts">
import AuthorAvatar from '@/components/AuthorAvatar.vue'
import type { Author } from '@/data/authors'

defineProps<{ user: Author; articleCount: number; likeCount: number }>()
</script>

<template>
  <section class="user-card" aria-label="Wizytówka użytkownika">
    <div class="cover" aria-hidden="true">
      <svg class="cover-grid" viewBox="0 0 280 68">
        <circle cx="240" cy="14" r="36" />
        <circle cx="40" cy="60" r="28" stroke-dasharray="3 4" />
      </svg>
    </div>
    <div class="avatar-wrap">
      <AuthorAvatar class="photo" :name="user.name" :size="68" />
    </div>
    <h2>{{ user.name }}</h2>
    <p class="field">{{ user.field }}</p>
    <p class="bio">{{ user.bio }}</p>
    <dl>
      <div class="stat-box">
        <dt>Artykuły</dt>
        <dd>{{ articleCount }}</dd>
      </div>
      <div class="stat-box">
        <dt>Polubienia</dt>
        <dd>{{ likeCount }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.user-card {
  position: relative;
  overflow: hidden;
  padding: 0 var(--space-5) var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
  text-align: center;
}

.cover {
  position: relative;
  overflow: hidden;
  height: 68px;
  margin: 0 calc(-1 * var(--space-5));
  background:
    radial-gradient(circle at 80% 20%, rgba(240, 180, 41, 0.35), transparent 55%),
    linear-gradient(135deg, var(--color-primary) 0%, #3d1c68 100%);
  border-bottom: 1px solid var(--color-border);
}

.cover-grid {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: rgba(255, 255, 255, 0.16);
  stroke-width: 1.2;
}

.avatar-wrap {
  position: relative;
  z-index: var(--z-raised);
  display: inline-flex;
  margin-top: -36px;
  margin-bottom: var(--space-2);
  padding: var(--space-1);
  border-radius: 50%;
  background: var(--color-surface);
  box-shadow: var(--shadow-xs);
}

h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 650;
}

.field {
  display: inline-block;
  margin: 6px 0 var(--space-3);
  padding: var(--space-05) var(--space-25);
  border-radius: var(--radius-pill);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: var(--text-xs);
  font-weight: 600;
}

.bio {
  margin: 0 0 var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: 1.55;
}

dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-2);
  margin: 0;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border-subtle);
}

.stat-box {
  padding: var(--space-2) var(--space-1);
  border-radius: var(--radius-sm);
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-subtle);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.user-card:hover .stat-box {
  border-color: var(--color-primary-border);
}

dt {
  color: var(--color-text-muted);
  font-size: var(--text-2xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

dd {
  margin: var(--space-05) 0 0;
  color: var(--color-primary);
  font-family: var(--font-display);
  font-size: var(--text-figure);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}
</style>
