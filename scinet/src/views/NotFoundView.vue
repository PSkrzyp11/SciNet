<template>
  <section class="not-found">
    <div class="orbit-card">
      <span class="code">404</span>
      <h1>Nie ma takiej strony</h1>
      <p class="lead">Adres jest nieprawidłowy albo strona została przeniesiona.</p>
      <RouterLink to="/" class="btn">Wróć na tablicę</RouterLink>
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
  font-family: var(--font-display);
  font-style: italic;
  font-size: clamp(4.5rem, 14vw, 7.5rem);
  font-weight: 700;
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

.btn {
  display: inline-block;
  padding: 13px 28px;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
  text-decoration: none;
  box-shadow: var(--shadow-xs);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring),
    box-shadow var(--duration-fast) var(--ease-out);
}

.btn:hover {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.btn:active {
  transform: scale(0.975);
}
</style>
