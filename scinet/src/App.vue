<script setup lang="ts">
import TopMenu from './components/TopMenu.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <TopMenu />
  <main>
    <RouterView />
  </main>
  <SiteFooter />
</template>
