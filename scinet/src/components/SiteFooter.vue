<template>
  <footer class="site-footer">
    <span>© {{ new Date().getFullYear() }} SciNet</span>
    <span>Nauka dla każdego</span>
  </footer>
</template>

<style scoped>
.site-footer {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 80px;
  padding: 28px 32px;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
</style>
