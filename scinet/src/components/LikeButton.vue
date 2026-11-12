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
  gap: var(--space-2);
  padding: 7px 14px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-text-soft);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring),
    box-shadow var(--duration-fast) var(--ease-out);
}

@media (pointer: coarse) {
  .like {
    min-height: 44px;
  }
}

.like:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
  box-shadow: var(--shadow-xs);
}

.like:active {
  transform: scale(0.94);
}

.like.liked {
  border-color: var(--color-accent-border);
  background: var(--color-accent);
  color: var(--color-on-accent);
  box-shadow: 0 2px 10px rgba(240, 180, 41, 0.28);
}

.like.liked:hover {
  border-color: var(--color-accent-hover);
  background: var(--color-accent-hover);
}

svg {
  flex-shrink: 0;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linejoin: round;
  transition: transform var(--duration-normal) var(--ease-spring);
}

.like:hover svg {
  transform: translateY(-1px) rotate(-6deg);
}

.liked svg {
  fill: currentColor;
  animation: thumb-pop var(--duration-normal) var(--ease-spring);
}

@keyframes thumb-pop {
  0% {
    transform: scale(0.8);
  }
  55% {
    transform: scale(1.24) rotate(-8deg);
  }
  100% {
    transform: scale(1) rotate(0);
  }
}

/* Liczby tej samej szerokości: licznik nie przesuwa sąsiednich elementów */
.count {
  padding-left: 2px;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-variant-numeric: tabular-nums;
}
</style>
