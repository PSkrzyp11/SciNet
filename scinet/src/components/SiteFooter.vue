<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="brand">
        <span class="brand-name">© {{ new Date().getFullYear() }} SciNet</span>
        <span class="sep" aria-hidden="true">·</span>
        <span class="motto">Nauka dla każdego</span>
      </div>
      <span class="colophon">Redakcyjny portal popularnonaukowy</span>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: var(--space-12);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-subtle);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  max-width: var(--board-max-width);
  margin: 0 auto;
  padding: var(--space-6) var(--space-7);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.brand-name {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-text);
}

.sep {
  color: var(--color-accent);
  font-weight: 700;
}

.colophon {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

@media (max-width: 560px) {
  .footer-inner {
    padding: var(--space-5);
  }
}
</style>
