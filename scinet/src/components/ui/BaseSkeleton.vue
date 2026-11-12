<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: string
    height?: string
    radius?: string
  }>(),
  {
    width: '100%',
    height: '1rem',
    radius: 'var(--radius-sm)',
  },
)
</script>

<template>
  <span
    class="base-skeleton"
    :style="{ width, height, borderRadius: radius }"
    aria-hidden="true"
  ></span>
</template>

<style scoped>
.base-skeleton {
  display: block;
  background: linear-gradient(
    90deg,
    var(--color-bg-subtle) 20%,
    var(--color-primary-light) 50%,
    var(--color-bg-subtle) 80%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s var(--ease-in-out) infinite;
}

@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .base-skeleton {
    animation: none;
  }
}
</style>
