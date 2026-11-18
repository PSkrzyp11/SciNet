import type { gsap as Gsap } from 'gsap'
import type { SplitText as SplitTextClass } from 'gsap/SplitText'

interface TextMotion {
  gsap: typeof Gsap
  SplitText: typeof SplitTextClass
}

let loading: Promise<TextMotion> | null = null

/**
 * Ładuje GSAP z pluginem SplitText tylko wtedy, gdy na stronie jest dzielony nagłówek.
 * GSAP i tak wczytuje się po starcie dla płynnego scrolla, więc zwykle jest już w pamięci.
 */
export function loadSplitText() {
  loading ??= Promise.all([import('gsap'), import('gsap/SplitText')])
    .then(([{ gsap }, { SplitText }]) => {
      gsap.registerPlugin(SplitText)
      return { gsap, SplitText }
    })
    .catch((error: unknown) => {
      // Po błędzie sieci kolejny nagłówek spróbuje jeszcze raz
      loading = null
      throw error
    })
  return loading
}
