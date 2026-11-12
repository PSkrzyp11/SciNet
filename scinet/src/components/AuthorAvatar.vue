<script setup lang="ts">
import { computed } from 'vue'
import { initials } from '@/data/authors'

// Imię jest zawsze obok awatara, więc czytniki ekranu go pomijają (aria-hidden)
const props = withDefaults(defineProps<{ name: string; size?: number }>(), { size: 40 })

const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  fontSize: `${Math.round(props.size * 0.36)}px`,
  borderWidth: props.size >= 56 ? '3px' : '2px',
}))
</script>

<template>
  <span class="avatar" :style="style" aria-hidden="true">{{ initials(name) }}</span>
</template>

<style scoped>
.avatar {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  border: solid var(--color-accent);
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 25%,
    #8453c2 0%,
    var(--color-primary) 65%,
    #432073 100%
  );
  color: #fff;
  font-family: var(--font-display);
  font-weight: 650;
  letter-spacing: -0.02em;
  line-height: 1;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.28),
    var(--shadow-xs);
  user-select: none;
}
</style>
