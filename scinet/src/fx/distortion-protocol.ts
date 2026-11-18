// Wiadomości między modułem imageDistortion a workerem, który rysuje efekt na obrazie

interface DistortionSize {
  /** Rozmiar canvasu w pikselach urządzenia */
  width: number
  height: number
}

export type ToDistortion =
  | { type: 'init'; canvas: OffscreenCanvas }
  // Nowy obraz pod kursorem: worker wgrywa teksturę i rozkręca efekt
  | ({ type: 'show'; bitmap: ImageBitmap } & DistortionSize)
  // Pozycja kursora 0–1 od lewego dolnego rogu obrazu
  | { type: 'pointer'; x: number; y: number }
  // Kursor zjechał z obrazu: efekt wygasa
  | { type: 'hide' }

export type FromDistortion =
  // Pierwsza klatka nowego obrazu jest gotowa, canvas może się pojawić
  | { type: 'ready' }
  // Efekt wygasł, canvas można schować
  | { type: 'idle' }
  // Brak WebGL, błąd shadera albo utrata kontekstu
  | { type: 'failed' }
