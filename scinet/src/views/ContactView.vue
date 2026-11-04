<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'

type Field = 'name' | 'email' | 'message'

const form = reactive({ name: '', email: '', message: '' })
const touched = reactive({ name: false, email: false, message: false })
const sent = ref(false)
const formElement = ref<HTMLFormElement | null>(null)

const errors = computed<Record<Field, string>>(() => ({
  name: form.name.trim().length < 2 ? 'Podaj imię (co najmniej 2 znaki).' : '',
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ? ''
    : 'Podaj poprawny adres e-mail.',
  message: form.message.trim().length < 10 ? 'Napisz wiadomość (co najmniej 10 znaków).' : '',
}))

// Błąd widać dopiero po wyjściu z wypełnionego pola albo po próbie wysłania
const visibleError = (field: Field) => (touched[field] ? errors.value[field] : '')

function fieldAttrs(field: Field) {
  const invalid = Boolean(visibleError(field))
  return {
    class: { invalid },
    'aria-invalid': invalid || undefined,
    'aria-describedby': invalid ? `${field}-error` : undefined,
    onBlur: () => {
      if (form[field].trim()) touched[field] = true
    },
  }
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
}

const info = [
  { label: 'E-mail', value: 'kontakt@scinet.pl' },
  { label: 'Adres', value: 'ul. Naukowa 12, 00-001 Warszawa' },
  { label: 'Odpowiadamy', value: 'pon.–pt., zwykle w ciągu 2 dni roboczych' },
]

const faq = [
  {
    question: 'Jak mogę zostać autorem?',
    answer:
      'Napisz do nas przez formularz, dołącz krótki opis siebie i pomysł na pierwszy artykuł. Odezwiemy się z dalszymi krokami.',
  },
  {
    question: 'Czy mogę cytować artykuły z SciNet?',
    answer:
      'Tak, pod warunkiem podania autora i linku do oryginalnego tekstu. Przy przedruku całego artykułu poproś nas o zgodę.',
  },
  {
    question: 'Znalazłem błąd w artykule. Co zrobić?',
    answer:
      'Daj nam znać, podając tytuł artykułu i fragment z błędem. Każde zgłoszenie sprawdzamy razem z autorem.',
  },
  {
    question: 'Czy SciNet jest płatny?',
    answer: 'Nie, wszystkie artykuły są dostępne za darmo i bez zakładania konta.',
  },
]
</script>

<template>
  <div class="contact">
    <h1>Kontakt</h1>
    <p class="lead">Masz pytanie albo pomysł na artykuł? Napisz do nas.</p>

    <div class="columns">
      <div v-if="sent" class="success">
        <strong>Dzięki! Wiadomość została wysłana.</strong>
        <p>Odpowiemy najszybciej, jak to możliwe.</p>
        <button class="link" @click="sent = false">Napisz kolejną wiadomość</button>
      </div>

      <form v-else ref="formElement" novalidate @submit.prevent="submit">
        <div class="field">
          <label>
            Imię
            <input v-model="form.name" type="text" required v-bind="fieldAttrs('name')" />
          </label>
          <span v-if="visibleError('name')" id="name-error" class="error">
            {{ visibleError('name') }}
          </span>
        </div>
        <div class="field">
          <label>
            E-mail
            <input v-model="form.email" type="email" required v-bind="fieldAttrs('email')" />
          </label>
          <span v-if="visibleError('email')" id="email-error" class="error">
            {{ visibleError('email') }}
          </span>
        </div>
        <div class="field">
          <label>
            Wiadomość
            <textarea
              v-model="form.message"
              rows="6"
              required
              v-bind="fieldAttrs('message')"
            ></textarea>
          </label>
          <span v-if="visibleError('message')" id="message-error" class="error">
            {{ visibleError('message') }}
          </span>
        </div>
        <!-- Bez blur przy wciśnięciu myszy błąd nie przesuwa przycisku w trakcie klikania -->
        <button type="submit" class="btn" @mousedown.prevent>Wyślij</button>
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
      <h2>Najczęstsze pytania</h2>
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
  gap: 24px;
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
  padding: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-text-soft);
  font-weight: 500;
}

input,
textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--color-input-border);
  border-radius: 10px;
  resize: vertical;
  transition: border-color 0.2s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

input.invalid,
textarea.invalid {
  border-color: var(--color-error);
}

.error {
  color: var(--color-error);
  font-size: 0.9rem;
}

.btn {
  align-self: flex-start;
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  background: var(--color-button);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.btn:hover {
  background: var(--color-button-hover);
}

.success {
  background: var(--color-success-bg);
  border-color: var(--color-success-border);
  color: var(--color-success-text);
}

.success p {
  margin: 8px 0 16px;
}

.link {
  padding: 0;
  border: none;
  background: none;
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}

.info {
  background: var(--color-panel);
  border-color: var(--color-primary-border);
}

.info h2 {
  font-size: 1.3rem;
}

dl {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin: 0;
}

dt {
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

dd {
  margin: 2px 0 0;
}

.faq {
  margin-top: 64px;
}

.faq h2 {
  text-align: center;
}

details {
  margin-bottom: 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

summary {
  padding: 20px 24px;
  font-weight: 600;
  cursor: pointer;
}

details[open] summary {
  color: var(--color-primary);
}

details p {
  margin: 0;
  padding: 0 24px 20px;
  color: var(--color-text-muted);
}
</style>
