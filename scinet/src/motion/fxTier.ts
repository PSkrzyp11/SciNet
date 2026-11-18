// Poziom efektów wybierany w jednym miejscu. Każdy efekt pyta o poziom, zamiast
// samodzielnie zgadywać, czy urządzenie da radę.
import { readonly, ref } from 'vue'

/**
 * - `full`: komputer z myszą i WebGL, wszystkie efekty,
 * - `lite`: ekran dotykowy, słabszy sprzęt albo oszczędzanie danych: natywny scroll,
 *   shader w niższej rozdzielczości, krótsze wejścia, bez kursora i zniekształceń obrazów,
 * - `off`: ograniczony ruch albo brak WebGL: statyczne tła i natychmiastowe zmiany.
 */
export type FxTier = 'full' | 'lite' | 'off'

export interface FxEnvironment {
  reducedMotion: boolean
  webgl: boolean
  /** Mysz albo gładzik (hover i precyzyjny wskaźnik) */
  finePointer: boolean
  /** Pamięć w GB z navigator.deviceMemory (Chrome), zaokrąglona przez przeglądarkę */
  deviceMemory?: number
  cores?: number
  saveData?: boolean
  reducedData?: boolean
}

// Poniżej tych wartości komputer dostaje poziom lekki
const MIN_MEMORY_GB = 4
const MIN_CORES = 4

export function detectFxTier(env: FxEnvironment): FxTier {
  if (env.reducedMotion || !env.webgl) return 'off'
  const weakDevice =
    (env.deviceMemory !== undefined && env.deviceMemory < MIN_MEMORY_GB) ||
    (env.cores !== undefined && env.cores < MIN_CORES)
  if (!env.finePointer || weakDevice || env.saveData || env.reducedData) return 'lite'
  return 'full'
}

type NavigatorWithHints = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

const QUERIES = {
  reducedMotion: '(prefers-reduced-motion: reduce)',
  finePointer: '(hover: hover) and (pointer: fine)',
  reducedData: '(prefers-reduced-data: reduce)',
}

const matches = (query: string) =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(query).matches
    : false

function readEnvironment(): FxEnvironment {
  const nav = (typeof navigator !== 'undefined' ? navigator : {}) as NavigatorWithHints
  return {
    reducedMotion: matches(QUERIES.reducedMotion),
    webgl: typeof WebGLRenderingContext !== 'undefined',
    finePointer: matches(QUERIES.finePointer),
    deviceMemory: nav.deviceMemory,
    cores: nav.hardwareConcurrency,
    saveData: nav.connection?.saveData === true,
    reducedData: matches(QUERIES.reducedData),
  }
}

const tier = ref<FxTier>('off')

function update() {
  tier.value = detectFxTier(readEnvironment())
  // CSS dostaje poziom w atrybucie, np. krótsze animacje dla html[data-fx='lite']
  if (typeof document !== 'undefined') document.documentElement.dataset.fx = tier.value
}

update()

// Ustawienie ruchu albo podłączenie myszy do tabletu zmienia poziom bez przeładowania
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  for (const query of Object.values(QUERIES)) {
    window.matchMedia(query).addEventListener?.('change', update)
  }
}

/** Aktualny poziom efektów (tylko do odczytu). */
export const fxTier = readonly(tier)
