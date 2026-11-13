<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    category?: string
    variant?: 'primary' | 'accent' | 'neutral'
    size?: 'sm' | 'md'
    mono?: boolean
  }>(),
  {
    category: undefined,
    variant: 'primary',
    size: 'md',
    mono: false,
  },
)

const categorySlug = computed(() => {
  switch (props.category) {
    case 'Fizyka':
      return 'physics'
    case 'Biologia':
      return 'biology'
    case 'Informatyka':
      return 'cs'
    case 'Astronomia':
      return 'astronomy'
    case 'Ekologia':
      return 'ecology'
    case 'Matematyka':
      return 'math'
    default:
      return ''
  }
})
</script>

<template>
  <span
    class="base-badge"
    :class="[categorySlug ? `cat-${categorySlug}` : `variant-${variant}`, `size-${size}`, { mono }]"
  >
    <slot>{{ category }}</slot>
  </span>
</template>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-15);
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  font-weight: 600;
  letter-spacing: 0.01em;
  line-height: 1.3;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.size-sm {
  padding: var(--space-05) var(--space-25);
  font-size: var(--text-xs);
}

.size-md {
  padding: var(--space-1) var(--space-35);
  font-size: var(--text-xs);
}

.mono {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

/* Warianty ogólne */
.variant-primary {
  background: var(--color-primary-light);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
}

.variant-accent {
  background: var(--color-accent);
  border-color: var(--color-accent-border);
  color: var(--color-on-accent);
}

.variant-neutral {
  background: var(--color-bg-subtle);
  border-color: var(--color-border);
  color: var(--color-text-soft);
}

/* Subtelne kodowanie 6 dziedzin nauki */
.cat-physics {
  background: var(--cat-physics-bg);
  border-color: var(--cat-physics-border);
  color: var(--cat-physics-text);
}

.cat-biology {
  background: var(--cat-biology-bg);
  border-color: var(--cat-biology-border);
  color: var(--cat-biology-text);
}

.cat-cs {
  background: var(--cat-cs-bg);
  border-color: var(--cat-cs-border);
  color: var(--cat-cs-text);
}

.cat-astronomy {
  background: var(--cat-astronomy-bg);
  border-color: var(--cat-astronomy-border);
  color: var(--cat-astronomy-text);
}

.cat-ecology {
  background: var(--cat-ecology-bg);
  border-color: var(--cat-ecology-border);
  color: var(--cat-ecology-text);
}

.cat-math {
  background: var(--cat-math-bg);
  border-color: var(--cat-math-border);
  color: var(--cat-math-text);
}
</style>
