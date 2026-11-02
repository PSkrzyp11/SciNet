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
  margin-top: 64px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #fff;
  color: #9ca3af;
  font-size: 0.9rem;
}
</style>
