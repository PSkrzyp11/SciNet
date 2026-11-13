import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { jumpTo } from '@/motion'
import BoardView from '@/views/BoardView.vue'

// Tyle trwa podmiana strony przez <Transition mode="out-in"> w App.vue
const RESTORE_DELAY = 80

/**
 * Dokąd przewinąć po nawigacji: `null` oznacza „zostaw jak jest”.
 * Zmiana samych parametrów (np. pisanie w wyszukiwarce) nie przewija strony,
 * nowa strona zaczyna się od góry, a „wstecz” wraca do zapamiętanej pozycji.
 */
export function scrollTarget(
  to: Pick<RouteLocationNormalized, 'path'>,
  from: Pick<RouteLocationNormalized, 'path'>,
  savedPosition: { top: number } | null,
) {
  if (to.path === from.path) return null
  return savedPosition?.top ?? 0
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: BoardView },
    // Stare linki do listy artykułów prowadzą teraz na tablicę, razem z filtrami
    { path: '/artykuly', redirect: (to) => ({ path: '/', query: to.query }) },
    {
      path: '/artykuly/:id',
      name: 'article',
      component: () => import('@/views/ArticleView.vue'),
      props: true,
      meta: { title: 'Artykuł' },
    },
    {
      path: '/artykuly/:id/edytuj',
      name: 'article-edit',
      component: () => import('@/views/EditArticleView.vue'),
      props: true,
      meta: { title: 'Edycja artykułu' },
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
  scrollBehavior(to, from, savedPosition) {
    const top = scrollTarget(to, from, savedPosition)
    if (top === null) return false

    if (top === 0) {
      jumpTo(0)
      return false
    }

    // Przy „wstecz” nowa strona musi się najpierw wyrenderować, żeby miała pełną wysokość
    return new Promise((resolve) => {
      window.setTimeout(() => {
        jumpTo(top)
        resolve(false)
      }, RESTORE_DELAY)
    })
  },
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | SciNet` : 'SciNet'
})

export default router
