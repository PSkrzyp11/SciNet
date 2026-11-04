<script setup lang="ts">
import { computed } from 'vue'
import { useFavoritesStore } from '@/stores/favorites'

const props = defineProps<{ articleId: number; withLabel?: boolean }>()

const favorites = useFavoritesStore()
const saved = computed(() => favorites.isFavorite(props.articleId))
</script>

<template>
  <button
    type="button"
    class="favorite"
    :class="{ saved, 'with-label': withLabel }"
    :aria-pressed="saved"
    :aria-label="withLabel ? undefined : 'Zapisz artykuł'"
    :title="saved ? 'Usuń z zapisanych' : 'Zapisz artykuł'"
    @click="favorites.toggle(articleId)"
  >
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
    </svg>
    <span v-if="withLabel">{{ saved ? 'Zapisano' : 'Zapisz' }}</span>
  </button>
</template>

<style scoped>
.favorite {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
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

.favorite:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

/* Na ekranach dotykowych przycisk ma wygodne 44 px */
@media (pointer: coarse) {
  .favorite {
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
  }
}

.favorite.with-label {
  padding: 6px 14px;
  border-color: var(--color-border);
  background: var(--color-surface);
  font-weight: 600;
}

.favorite.saved {
  color: var(--color-primary);
}

svg {
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linejoin: round;
}

.saved svg {
  fill: var(--color-accent);
}
</style>
