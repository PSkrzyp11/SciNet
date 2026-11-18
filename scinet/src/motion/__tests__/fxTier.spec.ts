import { describe, expect, it } from 'vitest'
import { detectFxTier, type FxEnvironment } from '../fxTier'

// Mocny komputer z myszą: punkt wyjścia, z którego każdy test zmienia jedną rzecz
const desktop: FxEnvironment = {
  reducedMotion: false,
  webgl: true,
  finePointer: true,
  deviceMemory: 8,
  cores: 8,
  saveData: false,
  reducedData: false,
}

describe('detectFxTier', () => {
  it('komputer z myszą i WebGL dostaje wszystkie efekty', () => {
    expect(detectFxTier(desktop)).toBe('full')
  })

  it('przeglądarka bez danych o sprzęcie (Safari, Firefox) też dostaje wszystko', () => {
    expect(detectFxTier({ ...desktop, deviceMemory: undefined, cores: undefined })).toBe('full')
  })

  it.each<[string, Partial<FxEnvironment>]>([
    ['ekran dotykowy', { finePointer: false }],
    ['mało pamięci', { deviceMemory: 2 }],
    ['mało rdzeni', { cores: 2 }],
    ['oszczędzanie danych', { saveData: true }],
    ['prośba o mniej danych', { reducedData: true }],
  ])('%s daje poziom lekki', (_name, change) => {
    expect(detectFxTier({ ...desktop, ...change })).toBe('lite')
  })

  it('cztery rdzenie i 4 GB to jeszcze poziom pełny', () => {
    expect(detectFxTier({ ...desktop, deviceMemory: 4, cores: 4 })).toBe('full')
  })

  it.each<[string, Partial<FxEnvironment>]>([
    ['ograniczony ruch', { reducedMotion: true }],
    ['brak WebGL', { webgl: false }],
    ['ograniczony ruch na telefonie', { reducedMotion: true, finePointer: false }],
  ])('%s wyłącza efekty', (_name, change) => {
    expect(detectFxTier({ ...desktop, ...change })).toBe('off')
  })
})
