<div align="center">

# SciNet

**Nauka podana po ludzku.**

Serwis z artykułami popularnonaukowymi: czytaj, wyszukuj i zapisuj teksty z różnych dziedzin nauki.

![Vue 3](https://img.shields.io/badge/Vue-3.5-42b883?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-4-f7d336?logo=pinia&logoColor=black)

</div>

## Funkcje

- **Tablica:** artykuły od najnowszego, wyszukiwanie po tytule, filtrowanie po kategorii i sortowanie. Kategoria i wyszukiwana fraza zapisują się w adresie, więc wynikami można się podzielić linkiem.
- **Strona artykułu:** pełna treść, autor, data i szacowany czas czytania.
- **Zapisane:** ulubione artykuły z licznikiem w menu, przechowywane w przeglądarce.
- **Autorzy:** krótkie opisy i listy napisanych tekstów.
- **Kontakt:** formularz z walidacją, dane kontaktowe i najczęstsze pytania.
- **Tryb ciemny:** dopasowuje się do ustawień systemu i zapamiętuje Twój wybór.
- **Widok na telefonie:** układ dopasowany do ekranu i rozwijane menu.
- **Dopracowane szczegóły:** płynne przejścia między stronami, strona 404 i osobny tytuł karty dla każdej podstrony.

> [!NOTE]
> To projekt do nauki. Artykuły, autorzy i dane kontaktowe są przykładowe, a formularz kontaktowy nie wysyła jeszcze wiadomości.

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
├── components/   # elementy wielokrotnego użytku: menu, stopka, karta artykułu
├── data/         # przykładowe artykuły i autorzy
├── router/       # adresy podstron i tytuły kart
├── stores/       # stan aplikacji: zapisane artykuły i motyw
├── views/        # całe podstrony
├── App.vue       # główny układ strony
├── main.ts       # punkt startowy aplikacji
└── style.css     # style globalne i kolory obu motywów
```

Nowy artykuł wystarczy dopisać w `scinet/src/data/articles.ts`. Tablica, filtry i strona Autorzy uwzględnią go automatycznie. Nową kategorię trzeba najpierw dodać do listy `CATEGORIES`.

## Plany

- [x] Testy automatyczne (Vitest)
- [ ] Publikacja aplikacji w internecie
- [ ] Artykuły pobierane z API i działający formularz kontaktowy
- [ ] Konta użytkowników i komentarze
