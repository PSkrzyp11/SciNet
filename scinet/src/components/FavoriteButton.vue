<script setup lang="ts">
import { computed } from 'vue'
import { useToast } from '@/composables/useToast'
import { useFavoritesStore } from '@/stores/favorites'

const props = defineProps<{ articleId: number; withLabel?: boolean }>()

const favorites = useFavoritesStore()
const { notify } = useToast()
const saved = computed(() => favorites.isFavorite(props.articleId))

function handleClick() {
  const wasSaved = saved.value
  favorites.toggle(props.articleId)
  notify(wasSaved ? 'Usunięto z zapisanych' : 'Zapisano artykuł na później', {
    variant: 'info',
    duration: 2400,
  })
}
</script>

<template>
  <button
    type="button"
    class="favorite"
    :class="{ saved, 'with-label': withLabel }"
    :aria-pressed="saved"
    :aria-label="withLabel ? undefined : 'Zapisz artykuł'"
    :title="saved ? 'Usuń z zapisanych' : 'Zapisz artykuł'"
    @click="handleClick"
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
  z-index: var(--z-raised);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.favorite:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.favorite:active {
  transform: scale(0.92);
}

@media (pointer: coarse) {
  .favorite {
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
  }
}

.favorite.with-label {
  padding: var(--space-2) var(--space-4);
  border-color: var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-text-soft);
  font-weight: 600;
}

.favorite.with-label:hover {
  border-color: var(--color-primary-border);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.favorite.saved {
  color: var(--color-primary);
}

.favorite.with-label.saved {
  border-color: var(--color-primary-border);
  background: var(--color-primary-light);
}

svg {
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linejoin: round;
  transition: transform var(--duration-normal) var(--ease-spring);
}

.saved svg {
  fill: var(--color-accent);
  animation: bookmark-pop var(--duration-normal) var(--ease-spring);
}

@keyframes bookmark-pop {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: translateY(-2px) scale(1.2);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}
</style>
