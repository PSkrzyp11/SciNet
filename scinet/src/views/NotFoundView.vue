<template>
  <section class="not-found">
    <span class="code">404</span>
    <h1>Nie ma takiej strony</h1>
    <p class="lead">Adres jest nieprawidłowy albo strona została przeniesiona.</p>
    <RouterLink to="/" class="btn">Wróć na tablicę</RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  padding: 56px 0;
  text-align: center;
}

.code {
  display: block;
  font-size: clamp(4rem, 14vw, 7rem);
  font-weight: 700;
  line-height: 1;
  color: var(--color-primary);
}

h1 {
  margin: 16px 0 12px;
}

.lead {
  margin: 0 auto 28px;
}

.btn {
  display: inline-block;
  padding: 14px 28px;
  border-radius: 12px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s;
}

.btn:hover {
  background: var(--color-primary-hover);
}
</style>
