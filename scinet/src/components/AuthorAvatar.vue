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
  background: var(--color-primary);
  color: #fff;
  font-weight: 700;
  line-height: 1;
}
</style>
