import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/artykuly', name: 'articles', component: () => import('@/views/ArticlesView.vue') },
    {
      path: '/artykuly/:id',
      name: 'article',
      component: () => import('@/views/ArticleView.vue'),
      props: true,
    },
    { path: '/autorzy', name: 'authors', component: () => import('@/views/AuthorsView.vue') },
    { path: '/kontakt', name: 'contact', component: () => import('@/views/ContactView.vue') },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
