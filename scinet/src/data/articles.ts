export interface Article {
  id: number
  title: string
  excerpt: string
  author: string
  category: string
  date: string
  content: string[]
}

const WORDS_PER_MINUTE = 200

// Szacowany czas czytania w minutach (co najmniej 1)
export function readingTime(article: Article) {
  const words = article.content.join(' ').trim().split(/\s+/).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

export const articles: Article[] = [
  {
    id: 1,
    title: 'Jak działają komputery kwantowe?',
    excerpt: 'Kubity, superpozycja i splątanie wyjaśnione bez skomplikowanej matematyki.',
    author: 'Anna Nowak',
    category: 'Fizyka',
    date: '2026-10-28',
    content: [
      'Zwykły komputer przechowuje informacje w bitach, które mają wartość 0 albo 1. Komputer kwantowy używa kubitów, które dzięki superpozycji mogą być jednocześnie w obu stanach, dopóki ich nie zmierzymy.',
      'Drugim kluczowym zjawiskiem jest splątanie. Dwa splątane kubity są ze sobą powiązane tak, że pomiar jednego od razu mówi nam coś o drugim, nawet jeśli dzieli je duża odległość.',
      'Nie oznacza to, że komputery kwantowe są po prostu „szybsze”. Sprawdzają się w konkretnych zadaniach, takich jak symulowanie cząsteczek czy niektóre problemy optymalizacyjne, a w codziennych zastosowaniach zwykły laptop nadal wygrywa.',
    ],
  },
  {
    id: 2,
    title: 'CRISPR w praktyce',
    excerpt: 'Edycja genów przestaje być science fiction. Gdzie jesteśmy dziś?',
    author: 'Marek Wiśniewski',
    category: 'Biologia',
    date: '2026-10-21',
    content: [
      'CRISPR-Cas9 to narzędzie, które pozwala precyzyjnie przeciąć DNA w wybranym miejscu. Pierwotnie był to mechanizm obronny bakterii przed wirusami, a naukowcy nauczyli się go wykorzystywać.',
      'Dziś CRISPR stosuje się w badaniach nad chorobami genetycznymi, w rolnictwie do tworzenia odporniejszych odmian roślin oraz w pierwszych zatwierdzonych terapiach, m.in. anemii sierpowatej.',
      'Wraz z możliwościami pojawiają się pytania etyczne: gdzie leży granica między leczeniem a „ulepszaniem” człowieka i kto powinien o tym decydować.',
    ],
  },
  {
    id: 3,
    title: 'Sieci neuronowe od podstaw',
    excerpt: 'Budujemy prosty model krok po kroku i sprawdzamy, czego się uczy.',
    author: 'Kasia Zielińska',
    category: 'Informatyka',
    date: '2026-10-14',
    content: [
      'Sieć neuronowa składa się z warstw prostych jednostek, tzw. neuronów. Każdy z nich mnoży dane wejściowe przez wagi, sumuje wynik i przepuszcza go przez funkcję aktywacji.',
      'Uczenie polega na pokazywaniu sieci przykładów i stopniowym poprawianiu wag tak, aby jej odpowiedzi były coraz bliższe prawidłowym. Odpowiada za to algorytm propagacji wstecznej.',
      'Nawet mała sieć z jedną warstwą ukrytą potrafi nauczyć się rozpoznawać odręcznie pisane cyfry z dokładnością powyżej 90%. To dobry pierwszy projekt na start.',
    ],
  },
  {
    id: 4,
    title: 'Czarne dziury na zdjęciach',
    excerpt: 'Jak astronomowie sfotografowali coś, czego z definicji nie widać.',
    author: 'Anna Nowak',
    category: 'Astronomia',
    date: '2026-10-05',
    content: [
      'Czarnej dziury nie da się zobaczyć bezpośrednio, bo nie wypuszcza nawet światła. Widać za to gorącą materię, która krąży wokół niej, oraz „cień”, jaki rzuca na to świecące tło.',
      'Aby uzyskać taki obraz, połączono radioteleskopy z całego świata w jeden wirtualny instrument wielkości Ziemi, nazwany Teleskopem Horyzontu Zdarzeń.',
      'Zdjęcia czarnych dziur w galaktyce M87 i w centrum Drogi Mlecznej potwierdziły przewidywania ogólnej teorii względności Einsteina z zaskakującą dokładnością.',
    ],
  },
  {
    id: 5,
    title: 'Mikroplastik w oceanach',
    excerpt: 'Skąd się bierze, gdzie trafia i co możemy z tym zrobić.',
    author: 'Tomasz Lewandowski',
    category: 'Ekologia',
    date: '2026-09-29',
    content: [
      'Mikroplastik to drobiny tworzyw sztucznych mniejsze niż 5 mm. Powstają z rozpadu większych odpadów, ale też z prania syntetycznych ubrań czy ścierania opon.',
      'Cząstki te trafiają do rzek i oceanów, gdzie zjadają je ryby i plankton. W ten sposób mikroplastik wraca do nas przez łańcuch pokarmowy.',
      'Najskuteczniej działa ograniczanie plastiku u źródła: lepsze filtry w pralkach, mniej jednorazowych opakowań i sprawny recykling.',
    ],
  },
  {
    id: 6,
    title: 'Matematyka w muzyce',
    excerpt: 'Proporcje, częstotliwości i to, dlaczego niektóre akordy brzmią dobrze.',
    author: 'Kasia Zielińska',
    category: 'Matematyka',
    date: '2026-09-18',
    content: [
      'Każdy dźwięk to drganie o określonej częstotliwości. Gdy dwa dźwięki mają częstotliwości w prostym stosunku, np. 2:1 (oktawa) albo 3:2 (kwinta), brzmią razem harmonijnie.',
      'Już Pitagoras zauważył, że długości strun dające przyjemne współbrzmienia układają się w proste proporcje. Na tym opierały się pierwsze systemy strojenia.',
      'Współczesne instrumenty używają stroju równomiernie temperowanego, w którym oktawa jest podzielona na 12 równych części. To kompromis, który pozwala grać w każdej tonacji.',
    ],
  },
]
