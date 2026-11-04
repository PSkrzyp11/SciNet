<div align="center">

# SciNet

**Nauka podana po ludzku.**

Portal społecznościowy dla ludzi nauki: tablica artykułów, które można publikować, poprawiać, polubić, komentować i zapisywać.

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-4-f7d336?logo=pinia&logoColor=black)

</div>

## Funkcje

- **Tablica:** artykuły od najnowszego, wyszukiwanie po tytule, filtrowanie po dziedzinie nauki i sortowanie. Dziedzina i wyszukiwana fraza zapisują się w adresie, więc wynikami można się podzielić linkiem.
- **Publikowanie:** formularz z walidacją, który przyjmuje tytuł, autora, dziedzinę, treść i opcjonalnie adres obrazka.
- **Edycja i usuwanie:** każdy artykuł można poprawić albo usunąć, a usunięty nie wraca po odświeżeniu.
- **Polubienia:** przycisk „Lubię to” z licznikiem, a drugie kliknięcie cofa polubienie.
- **Komentarze:** lista i formularz pod każdym artykułem oraz licznik na karcie.
- **Panele boczne:** wizytówka użytkownika i najczęściej polubione artykuły.
- **Zapisane:** zakładki z licznikiem w menu i osobną podstroną.
- **Autorzy:** krótkie opisy i listy tekstów, także osób wpisanych w formularzu.
- **Kontakt:** formularz z walidacją, dane kontaktowe i najczęstsze pytania.
- **Każdy ekran:** trzy kolumny na komputerze, dwie na tablecie i jedna na telefonie, bez przewijania na boki.
- **Kolory:** jeden motyw w barwach royal purple, biel i sunglow gold.

Portal działa w całości w przeglądarce, bez serwera i bazy danych. Dane zapisują się w `localStorage`, więc zostają po odświeżeniu strony, ale nie przenoszą się na inne urządzenia.

> [!NOTE]
> To projekt na zakończenie kursu Vue. Przykładowe artykuły, autorzy i dane kontaktowe są zmyślone, a formularz kontaktowy nie wysyła wiadomości.

## Technologie

| Obszar | Narzędzie |
| --- | --- |
| Framework | [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`) |
| Język | [TypeScript](https://www.typescriptlang.org/) |
| Routing | [Vue Router](https://router.vuejs.org/) |
| Stan aplikacji | [Pinia](https://pinia.vuejs.org/) |
| Budowanie | [Vite](https://vite.dev/) |
| Testy | [Vitest](https://vitest.dev/), [Vue Test Utils](https://test-utils.vuejs.org/) |
| Jakość kodu | ESLint, Oxlint, Prettier |

## Uruchomienie

Potrzebny jest [Node.js](https://nodejs.org/) w wersji `^22.18.0` lub `>=24.12.0`.

```bash
git clone https://github.com/PSkrzyp11/SciNet.git
cd SciNet/scinet
npm install
npm run dev
```

Aplikacja uruchomi się pod adresem http://localhost:5173.

### Przydatne polecenia

Uruchamiaj je w folderze `scinet`.

| Polecenie | Działanie |
| --- | --- |
| `npm run dev` | serwer deweloperski |
| `npm run build` | sprawdzenie typów i wersja produkcyjna |
| `npm run preview` | podgląd wersji produkcyjnej |
| `npm test` | jednorazowe uruchomienie testów |
| `npm run test:watch` | testy uruchamiane przy każdej zmianie |
| `npm run type-check` | samo sprawdzenie typów |
| `npm run lint` | sprawdzenie i poprawa kodu |
| `npm run format` | formatowanie kodu |

## Struktura projektu

```text
scinet/src/
├── components/   # karta artykułu, formularz, komentarze, panele, menu
├── data/         # model danych, przykładowe artykuły i autorzy
├── router/       # adresy podstron i tytuły kart
├── stores/       # stan aplikacji: artykuły i zakładki
├── views/        # całe podstrony, w tym tablica
├── App.vue       # główny układ strony
├── main.ts       # punkt startowy aplikacji
└── style.css     # style globalne i kolory
```

Komponenty dostają dane przez propsy, a zmiany zgłaszają przez emity. Dane w store'ach zmieniają dopiero widoki.

### Przykładowe dane

Przykładowe artykuły z `scinet/src/data/articles.ts` wczytują się tylko przy pierwszym uruchomieniu. Później aplikacja korzysta z danych zapisanych w przeglądarce, więc po zmianie tego pliku trzeba usunąć klucz `scinet-articles` z `localStorage`. Nową dziedzinę nauki dodaje się do listy `CATEGORIES`.

Obrazki przykładowych artykułów są w domenie publicznej i pochodzą z Wikimedia Commons: [ilustracja NASA/CXC/SAO](https://commons.wikimedia.org/wiki/File:Artist%27s_illustration_showing_material_in_a_disk_that_is_falling_towards_a_supermassive_black_hole.jpg) i [zdjęcie NOAA Marine Debris Program](https://commons.wikimedia.org/wiki/File:Pre-production_plastic_pellets_(7656726070).jpg).

## Plany

- [x] Testy automatyczne (Vitest)
- [x] Publikowanie, edycja, usuwanie i komentarze
- [x] Polubienia, panele boczne i widok na każdy ekran
- [ ] Publikacja aplikacji w internecie
