<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import SplitHeading from '@/components/SplitHeading.vue'
import WeightText from '@/components/WeightText.vue'
</script>

<template>
  <section class="not-found">
    <div class="orbit-card">
      <WeightText class="code" text="404" label="Błąd 404" :min="400" />
      <SplitHeading text="Nie ma takiej strony" :delay="0.15" />
      <p class="lead">Adres jest nieprawidłowy albo strona została przeniesiona.</p>
      <BaseButton to="/" class="btn">Wróć na tablicę</BaseButton>
    </div>
  </section>
</template>

<style scoped>
.not-found {
  padding: var(--space-10) 0;
  text-align: center;
}

.orbit-card {
  max-width: 560px;
  margin: 0 auto;
  padding: var(--space-9) var(--space-6);
  background:
    radial-gradient(circle at 50% 0%, rgba(240, 180, 41, 0.18), transparent 55%),
    var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.code {
  display: block;
  font-size: var(--text-mega);
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--color-primary);
}

h1 {
  margin: var(--space-4) 0 var(--space-3);
}

.lead {
  margin: 0 auto var(--space-6);
}
</style>
