// Wiadomości między komponentem GradientCanvas a workerem, który rysuje gradient

type Rgb = [number, number, number]

/** Kolory z tokenów `--fx-*`. `null` znaczy, że tokenu nie dało się odczytać. */
export interface GradientColors {
  base: Rgb | null
  color1: Rgb | null
  color2: Rgb | null
  color3: Rgb | null
  grain: number
}

/** Rozmiar w pikselach urządzenia (CSS × DPR), zanim worker obniży rozdzielczość. */
export interface GradientSize {
  width: number
  height: number
}

export type ToWorker =
  | ({ type: 'init'; canvas: OffscreenCanvas; colors: GradientColors } & GradientSize)
  | ({ type: 'resize' } & GradientSize)
  | { type: 'colors'; colors: GradientColors }
  | { type: 'play' }
  | { type: 'pause' }
  // Kursor nad hero: pozycja 0–1 od lewego dolnego rogu, `active` znika po wyjściu kursora
  | { type: 'pointer'; x: number; y: number; active: boolean }
  // Prędkość przewijania 0–1 (1 to bardzo szybki scroll)
  | { type: 'velocity'; value: number }

export type FromWorker =
  // Pierwsza klatka jest gotowa, canvas może się pojawić
  | { type: 'ready' }
  // Licznik klatek, żeby dało się sprawdzić, że render poza ekranem stoi
  | { type: 'frames'; frames: number }
  // Brak WebGL, błąd shadera, utrata kontekstu albo zbyt wolne urządzenie
  | { type: 'failed' }
