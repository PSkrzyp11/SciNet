import { computed } from 'vue'
import { fxTier } from '@/motion/fxTier'

/** Poziom efektów do użycia w komponentach: `full`, `lite` albo `off`. */
export function useFxTier() {
  return {
    tier: fxTier,
    /** Wszystkie efekty, także kursor i zniekształcenia obrazów */
    isFull: computed(() => fxTier.value === 'full'),
    /** Jakiekolwiek animacje (poziom pełny albo lekki) */
    animated: computed(() => fxTier.value !== 'off'),
  }
}
