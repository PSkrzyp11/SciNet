<script setup lang="ts">
import MarqueeStrip from '@/components/MarqueeStrip.vue'
import SplitHeading from '@/components/SplitHeading.vue'
import WeightText from '@/components/WeightText.vue'
import { CATEGORIES } from '@/data/articles'

const year = new Date().getFullYear()

const links = [
  { to: '/', label: 'Tablica' },
  { to: '/autorzy', label: 'Autorzy' },
  { to: '/zapisane', label: 'Zapisane' },
  { to: '/kontakt', label: 'Kontakt' },
]
</script>

<template>
  <footer class="site-footer">
    <MarqueeStrip
      class="footer-marquee"
      :items="CATEGORIES"
      label="Dziedziny nauki w stopce"
      size="lg"
      reverse
    />

    <div class="footer-inner">
      <div class="footer-intro">
        <span class="label">SciNet / {{ year }}</span>
        <SplitHeading as="h2" text="Nauka opowiedziana przystępnie" trigger="view" />
      </div>

      <nav class="footer-nav" aria-label="Stopka">
        <span class="label">Mapa</span>
        <ul>
          <li v-for="link in links" :key="link.to">
            <RouterLink :to="link.to">{{ link.label }}</RouterLink>
          </li>
        </ul>
      </nav>

      <div class="footer-about">
        <span class="label">O projekcie</span>
        <p>
          Redakcyjny portal popularnonaukowy. Artykuły, polubienia i komentarze zapisują się w
          Twojej przeglądarce.
        </p>
      </div>

      <WeightText class="footer-mega" text="SciNet" :min="500" />

      <div class="footer-base">
        <span>© {{ year }} SciNet</span>
        <span>Nauka dla każdego</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  margin-top: var(--space-section);
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-subtle);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  /* Duży napis nie może poszerzyć strony na wąskim ekranie */
  overflow: hidden;
}

.footer-marquee {
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

/* Siatka 12 kolumn: na telefonie wszystko jedno pod drugim */
.footer-inner {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), minmax(0, 1fr));
  column-gap: var(--grid-gap);
  row-gap: var(--space-7);
  max-width: var(--board-max-width);
  margin: 0 auto;
  padding: var(--space-9) var(--space-5) var(--space-5);
}

.footer-inner > * {
  grid-column: 1 / -1;
}

@media (min-width: 760px) {
  .footer-inner {
    padding-inline: var(--space-7);
  }

  .footer-intro {
    grid-column: 1 / 7;
  }

  .footer-nav {
    grid-column: 8 / 10;
  }

  .footer-about {
    grid-column: 10 / 13;
  }
}

.label {
  display: block;
  margin-bottom: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 600;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.footer-intro h2 {
  margin: 0;
  max-width: 14ch;
  font-family: var(--font-display);
  font-size: clamp(1.9rem, 1.2rem + 2.6vw, 3.25rem);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.03em;
  color: var(--color-text);
}

.footer-nav ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer-nav a {
  display: inline-block;
  padding: var(--space-1) 0;
  color: var(--color-text);
  font-weight: 600;
  text-decoration: none;
  transition:
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring);
}

.footer-nav a:hover {
  color: var(--color-primary);
  transform: translateX(3px);
}

.footer-about p {
  margin: 0;
  max-width: 34ch;
  line-height: var(--leading-relaxed);
}

/* Napis na całą szerokość: litery grubieją pod kursorem */
.footer-mega {
  justify-self: center;
  margin-top: var(--space-6);
  font-size: min(25vw, 17rem);
  line-height: 0.8;
  letter-spacing: -0.04em;
  color: var(--color-primary);
}

.footer-base {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}
</style>
