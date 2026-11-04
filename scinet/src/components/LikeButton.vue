<script setup lang="ts">
defineProps<{ count: number; liked: boolean }>()

// Przycisk tylko zgłasza kliknięcie, a liczbę polubień zmienia rodzic
const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    type="button"
    class="like"
    :class="{ liked }"
    :aria-pressed="liked"
    :title="liked ? 'Cofnij polubienie' : 'Polub artykuł'"
    @click="emit('toggle')"
  >
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3zm0 0l4-7a2.2 2.2 0 0 1 3 2.2L13.4 9H19a2 2 0 0 1 2 2.4l-1.5 8A2 2 0 0 1 17.5 21H7"
      />
    </svg>
    <span>Lubię to</span>
    <span class="count">{{ count }}</span>
  </button>
</template>

<style scoped>
/* Przycisk leży nad linkiem rozciągniętym na całą kartę */
.like {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    border-color 0.2s,
    color 0.2s;
}

.like:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.like.liked {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  color: var(--color-primary);
}

svg {
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linejoin: round;
}

.liked svg {
  fill: currentColor;
}

/* Liczby tej samej szerokości: licznik nie przesuwa sąsiednich elementów */
.count {
  font-variant-numeric: tabular-nums;
}
</style>
