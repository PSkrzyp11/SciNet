<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: 'div' | 'section' | 'article' | 'aside'
    variant?: 'default' | 'interactive' | 'tinted' | 'elevated'
    padding?: 'sm' | 'md' | 'lg'
  }>(),
  {
    as: 'div',
    variant: 'default',
    padding: 'md',
  },
)
</script>

<template>
  <component :is="as" class="base-card" :class="[`variant-${variant}`, `pad-${padding}`]">
    <slot />
  </component>
</template>

<style scoped>
.base-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
  transition:
    transform var(--duration-normal) var(--ease-out),
    box-shadow var(--duration-normal) var(--ease-out),
    border-color var(--duration-normal) var(--ease-out),
    background-color var(--duration-normal) var(--ease-out);
}

.pad-sm {
  padding: var(--space-5);
}

.pad-md {
  padding: var(--space-6);
}

.pad-lg {
  padding: var(--space-7);
}

@media (max-width: 560px) {
  .pad-md,
  .pad-lg {
    padding: var(--space-5);
  }
}

.variant-interactive:hover {
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.variant-tinted {
  background: var(--color-surface-tint);
  border-color: var(--color-primary-border);
}

.variant-elevated {
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-sm);
}
</style>
