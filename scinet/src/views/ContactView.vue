<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useToast } from '@/composables/useToast'

type Field = 'name' | 'email' | 'message'

const { notify } = useToast()

const form = reactive({ name: '', email: '', message: '' })
const touched = reactive({ name: false, email: false, message: false })
const sent = ref(false)
const formElement = ref<HTMLFormElement | null>(null)

const errors = computed<Record<Field, string>>(() => ({
  name: form.name.trim().length < 2 ? 'Podaj imię (co najmniej 2 znaki).' : '',
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? '' : 'Podaj poprawny adres e-mail.',
  message: form.message.trim().length < 10 ? 'Napisz wiadomość (co najmniej 10 znaków).' : '',
}))

// Błąd widać dopiero po wyjściu z wypełnionego pola albo po próbie wysłania
const visibleError = (field: Field) => (touched[field] ? errors.value[field] : '')

// Wspólne ustawienia pola: nazwa, błąd i jego identyfikator dla czytnika ekranu
function fieldProps(field: Field) {
  return { name: field, error: visibleError(field), errorId: `${field}-error` }
}

function touch(field: Field) {
  if (form[field].trim()) touched[field] = true
}

async function submit() {
  Object.assign(touched, { name: true, email: true, message: true })

  if (Object.values(errors.value).some(Boolean)) {
    await nextTick()
    formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }

  sent.value = true
  Object.assign(form, { name: '', email: '', message: '' })
  Object.assign(touched, { name: false, email: false, message: false })
  notify('Wiadomość została wysłana', {
    description: 'Redakcja SciNet odpowie w ciągu 2 dni roboczych.',
    variant: 'success',
  })
}

const info = [
  { label: 'E-mail', value: 'kontakt@scinet.pl' },
  { label: 'Adres', value: 'ul. Naukowa 12, 00-001 Warszawa' },
  { label: 'Odpowiadamy', value: 'pon.–pt., zwykle w ciągu 2 dni roboczych' },
]

const faq = [
  {
    question: 'Jak opublikować artykuł?',
    answer:
      'Kliknij „Dodaj artykuł” na tablicy, wpisz tytuł, autora i treść, a jeśli chcesz, dodaj też adres obrazka. Artykuł od razu pojawi się na górze tablicy.',
  },
  {
    question: 'Gdzie zapisują się moje artykuły?',
    answer:
      'W Twojej przeglądarce. Artykuły, polubienia i komentarze zostają po odświeżeniu strony, ale nie zobaczysz ich na innym urządzeniu.',
  },
  {
    question: 'Czy mogę cytować artykuły z SciNet?',
    answer:
      'Tak, pod warunkiem podania autora i linku do oryginalnego tekstu. Przy przedruku całego artykułu poproś nas o zgodę.',
  },
  {
    question: 'Znalazłem błąd w artykule. Co zrobić?',
    answer:
      'Otwórz artykuł i kliknij „Edytuj”, żeby go poprawić. Możesz też dodać komentarz z informacją o błędzie.',
  },
  {
    question: 'Czy SciNet jest płatny?',
    answer: 'Nie, wszystkie artykuły są dostępne za darmo i bez zakładania konta.',
  },
]
</script>

<template>
  <div class="contact">
    <header class="contact-head">
      <span class="eyebrow">Redakcja SciNet</span>
      <h1>Kontakt</h1>
      <p class="lead">Masz pytanie albo pomysł na portal? Napisz do nas.</p>
    </header>

    <div class="columns">
      <div v-if="sent" class="success" role="status">
        <span class="success-badge" aria-hidden="true">✓ Wysłano</span>
        <strong>Dzięki! Wiadomość została wysłana.</strong>
        <p>Odpowiemy najszybciej, jak to możliwe.</p>
        <BaseButton variant="secondary" class="link" @click="sent = false">
          Napisz kolejną wiadomość
        </BaseButton>
      </div>

      <form v-else ref="formElement" novalidate @submit.prevent="submit">
        <BaseInput
          v-model="form.name"
          label="Imię"
          placeholder="Twoje imię"
          autocomplete="name"
          required
          v-bind="fieldProps('name')"
          @blur="touch('name')"
        />
        <BaseInput
          v-model="form.email"
          type="email"
          label="E-mail"
          placeholder="imie@domena.pl"
          autocomplete="email"
          required
          v-bind="fieldProps('email')"
          @blur="touch('email')"
        />
        <BaseInput
          v-model="form.message"
          type="textarea"
          label="Wiadomość"
          :rows="6"
          placeholder="Opisz swój pomysł lub pytanie…"
          required
          v-bind="fieldProps('message')"
          @blur="touch('message')"
        />
        <!-- Bez blur przy wciśnięciu myszy błąd nie przesuwa przycisku w trakcie klikania -->
        <BaseButton type="submit" class="btn" @mousedown.prevent>Wyślij</BaseButton>
      </form>

      <aside class="info">
        <h2>Dane kontaktowe</h2>
        <dl>
          <div v-for="item in info" :key="item.label">
            <dt>{{ item.label }}</dt>
            <dd>{{ item.value }}</dd>
          </div>
        </dl>
      </aside>
    </div>

    <section class="faq">
      <header class="faq-head">
        <span class="eyebrow">Baza wiedzy</span>
        <h2>Najczęstsze pytania</h2>
      </header>
      <details v-for="item in faq" :key="item.question">
        <summary>{{ item.question }}</summary>
        <p>{{ item.answer }}</p>
      </details>
    </section>
  </div>
</template>

<style scoped>
.contact {
  max-width: 980px;
  margin: 0 auto;
}

.contact-head {
  margin-top: var(--space-8);
  text-align: center;
}

.eyebrow {
  display: inline-block;
  margin-bottom: var(--space-1);
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--color-primary);
}

h1 {
  margin-top: 0;
}

h1,
.lead {
  text-align: center;
}

.lead {
  margin-left: auto;
  margin-right: auto;
}

.columns {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--space-6);
  align-items: start;
}

@media (max-width: 760px) {
  .columns {
    grid-template-columns: minmax(0, 1fr);
  }
}

form,
.info,
.success {
  padding: var(--space-7);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
}

@media (max-width: 560px) {
  form,
  .info,
  .success {
    padding: var(--space-5);
  }
}

form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.btn {
  align-self: flex-start;
}

.success {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: var(--color-accent-light);
  border-color: var(--color-accent-border);
  color: var(--color-text);
}

.success-badge {
  display: inline-block;
  margin-bottom: var(--space-2);
  padding: var(--space-1) var(--space-25);
  border-radius: var(--radius-pill);
  background: var(--color-accent);
  color: var(--color-on-accent);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 700;
}

.success strong {
  font-family: var(--font-display);
  font-size: var(--text-lg);
}

.success p {
  margin: var(--space-2) 0 var(--space-4);
  color: var(--color-text-soft);
}

.info {
  background:
    radial-gradient(circle at 90% 10%, rgba(240, 180, 41, 0.16), transparent 50%),
    var(--color-surface-tint);
  border-color: var(--color-primary-border);
}

.info h2 {
  font-size: var(--text-xl);
}

dl {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin: 0;
}

dt {
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

dd {
  margin: var(--space-1) 0 0;
  font-weight: 500;
}

.faq {
  margin-top: var(--space-10);
}

.faq-head {
  margin-bottom: var(--space-5);
  text-align: center;
}

.faq h2 {
  margin: 0;
  text-align: center;
}

details {
  margin-bottom: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

details:hover {
  border-color: var(--color-primary-border);
}

details[open] {
  border-color: var(--color-primary-border);
  box-shadow: var(--shadow-sm);
}

summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-6);
  font-family: var(--font-display);
  font-size: var(--text-md);
  font-weight: 600;
  list-style: none;
  cursor: pointer;
}

summary::-webkit-details-marker {
  display: none;
}

summary::after {
  content: '+';
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-family: var(--font-mono);
  font-size: var(--text-md);
  font-weight: 500;
  transition:
    transform var(--duration-normal) var(--ease-spring),
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

details[open] summary {
  color: var(--color-primary);
}

details[open] summary::after {
  background: var(--color-primary);
  color: var(--color-on-primary);
  transform: rotate(45deg);
}

details p {
  margin: 0;
  padding: 0 var(--space-6) var(--space-5);
  color: var(--color-text-muted);
  line-height: var(--leading-normal);
}
</style>
