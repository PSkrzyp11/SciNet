import { onScopeDispose, ref } from 'vue'

/** Czy użytkownik prosi system o ograniczenie ruchu. Reaguje na zmianę ustawienia na żywo. */
export function useReducedMotion() {
  const reduced = ref(false)
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return reduced

  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduced.value = query.matches

  const update = (event: MediaQueryListEvent) => {
    reduced.value = event.matches
  }
  query.addEventListener('change', update)
  onScopeDispose(() => query.removeEventListener('change', update))

  return reduced
}
