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
  border-top: 3px solid var(--color-accent);
  background: var(--color-primary);
  color: #fff;
  font-size: 0.9rem;
}
</style>
