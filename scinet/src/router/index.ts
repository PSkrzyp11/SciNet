import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/artykuly',
      name: 'articles',
      component: () => import('@/views/ArticlesView.vue'),
      meta: { title: 'Artykuły' },
    },
    {
      path: '/artykuly/:id',
      name: 'article',
      component: () => import('@/views/ArticleView.vue'),
      props: true,
      meta: { title: 'Artykuł' },
    },
    {
      path: '/autorzy',
      name: 'authors',
      component: () => import('@/views/AuthorsView.vue'),
      meta: { title: 'Autorzy' },
    },
    {
      path: '/zapisane',
      name: 'favorites',
      component: () => import('@/views/FavoritesView.vue'),
      meta: { title: 'Zapisane' },
    },
    {
      path: '/kontakt',
      name: 'contact',
      component: () => import('@/views/ContactView.vue'),
      meta: { title: 'Kontakt' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
      meta: { title: 'Nie znaleziono strony' },
    },
  ],
  // Zmiana samych parametrów (np. pisanie w wyszukiwarce) nie przewija strony
  scrollBehavior: (to, from) => (to.path === from.path ? false : { top: 0 }),
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | SciNet` : 'SciNet'
})

export default router
