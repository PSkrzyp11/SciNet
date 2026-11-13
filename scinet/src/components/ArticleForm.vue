<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import {
  CATEGORIES,
  isImageUrl,
  toParagraphs,
  type ArticleDraft,
  type Category,
} from '@/data/articles'
import { currentUser } from '@/data/authors'

type Field = 'title' | 'author' | 'category' | 'content' | 'image'

// Z propsem initial formularz służy do edycji istniejącego artykułu
const props = defineProps<{ initial?: ArticleDraft }>()

// Formularz nie zna store'a: gotowe dane przekazuje rodzicowi przez emit
const emit = defineEmits<{ save: [draft: ArticleDraft]; cancel: [] }>()

const form = reactive({
  title: props.initial?.title ?? '',
  author: props.initial?.author ?? currentUser.name,
  category: (props.initial?.category ?? '') as Category | '',
  content: props.initial?.content.join('\n\n') ?? '',
  image: props.initial?.image ?? '',
})
const touched = reactive({
  title: false,
  author: false,
  category: false,
  content: false,
  image: false,
})
const formElement = ref<HTMLFormElement | null>(null)

const wordCount = computed(() => {
  const trimmed = form.content.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
})

const errors = computed<Record<Field, string>>(() => ({
  title: form.title.trim() ? '' : 'Podaj tytuł artykułu.',
  author: form.author.trim() ? '' : 'Podaj autora.',
  category: form.category ? '' : 'Wybierz dziedzinę.',
  content: form.content.trim() ? '' : 'Napisz treść artykułu.',
  // Obrazek jest opcjonalny, więc sprawdzamy tylko wpisany adres
  image:
    form.image.trim() && !isImageUrl(form.image.trim())
      ? 'Podaj pełny adres zaczynający się od http:// lub https://.'
      : '',
}))

// Błąd widać dopiero po wyjściu z wypełnionego pola albo po próbie publikacji
const visibleError = (field: Field) => (touched[field] ? errors.value[field] : '')

function fieldAttrs(field: Field) {
  const invalid = Boolean(visibleError(field))
  return {
    class: { invalid },
    name: field,
    'aria-invalid': invalid || undefined,
    'aria-describedby': invalid ? `article-${field}-error` : undefined,
    onBlur: () => {
      if (form[field].trim()) touched[field] = true
    },
  }
}

async function submit() {
  Object.assign(touched, { title: true, author: true, category: true, content: true, image: true })

  if (!form.category || Object.values(errors.value).some(Boolean)) {
    await nextTick()
    formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }

  emit('save', {
    title: form.title.trim(),
    author: form.author.trim(),
    category: form.category,
    content: toParagraphs(form.content),
    image: form.image.trim() || undefined,
  })
}

onMounted(() => formElement.value?.querySelector('input')?.focus())
</script>

<template>
  <form ref="formElement" class="article-form" novalidate @submit.prevent="submit">
    <header v-if="!initial" class="form-head">
      <span class="eyebrow">Kolegium Redakcyjne</span>
      <h2>Nowy artykuł</h2>
    </header>

    <div class="field">
      <label>
        <span class="label-text">Tytuł</span>
        <input
          v-model="form.title"
          type="text"
          placeholder="Np. Jak grzyby komunikują się pod ziemią?"
          required
          v-bind="fieldAttrs('title')"
        />
      </label>
      <span v-if="visibleError('title')" id="article-title-error" class="error" role="alert">
        {{ visibleError('title') }}
      </span>
    </div>

    <div class="row">
      <div class="field">
        <label>
          <span class="label-text">Autor</span>
          <input v-model="form.author" type="text" required v-bind="fieldAttrs('author')" />
        </label>
        <span v-if="visibleError('author')" id="article-author-error" class="error" role="alert">
          {{ visibleError('author') }}
        </span>
      </div>

      <div class="field">
        <label>
          <span class="label-text">Dziedzina nauki</span>
          <select v-model="form.category" required v-bind="fieldAttrs('category')">
            <option value="" disabled>Wybierz dziedzinę</option>
            <option v-for="category in CATEGORIES" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </label>
        <span
          v-if="visibleError('category')"
          id="article-category-error"
          class="error"
          role="alert"
        >
          {{ visibleError('category') }}
        </span>
      </div>
    </div>

    <div class="field">
      <label>
        <span class="label-row">
          <span class="label-text">Treść</span>
          <span class="word-counter" aria-hidden="true">{{ wordCount }} słów</span>
        </span>
        <textarea
          v-model="form.content"
          rows="8"
          placeholder="Wyjaśnij zagadnienie krok po kroku…"
          required
          v-bind="fieldAttrs('content')"
        ></textarea>
      </label>
      <span v-if="visibleError('content')" id="article-content-error" class="error" role="alert">
        {{ visibleError('content') }}
      </span>
      <span v-else class="hint">Akapity oddziel pustą linią.</span>
    </div>

    <div class="field">
      <label>
        <span class="label-text">Adres obrazka (opcjonalnie)</span>
        <input
          v-model="form.image"
          type="url"
          placeholder="https://"
          v-bind="fieldAttrs('image')"
        />
      </label>
      <span v-if="visibleError('image')" id="article-image-error" class="error" role="alert">
        {{ visibleError('image') }}
      </span>
      <span v-else class="hint">Podaj adres obrazka z internetu, nie plik z komputera.</span>
    </div>

    <!-- Bez blur przy wciśnięciu myszy błąd adresu nie przesuwa przycisków w trakcie klikania -->
    <div class="actions">
      <button type="submit" class="publish" @mousedown.prevent>
        {{ initial ? 'Zapisz zmiany' : 'Opublikuj' }}
      </button>
      <button type="button" class="cancel" @mousedown.prevent @click="emit('cancel')">
        Anuluj
      </button>
    </div>
  </form>
</template>

<style scoped>
.article-form {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  margin-bottom: var(--space-7);
  padding: var(--space-7);
  background: var(--color-surface);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
}

@media (max-width: 560px) {
  .article-form {
    padding: var(--space-5);
  }
}

.form-head {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--color-border-subtle);
}

.eyebrow {
  font-family: var(--font-mono);
  font-size: var(--text-2xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  color: var(--color-primary);
}

h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--text-xl);
}

.row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
}

@media (max-width: 560px) {
  .row {
    grid-template-columns: minmax(0, 1fr);
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-15);
}

label {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--color-text-soft);
  font-size: var(--text-sm);
  font-weight: 600;
}

.label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}

.word-counter {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-muted);
}

input,
select,
textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--text-base);
  font-weight: 400;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

textarea {
  resize: vertical;
  line-height: var(--leading-normal);
}

input:hover:not(:focus),
select:hover:not(:focus),
textarea:hover:not(:focus) {
  border-color: var(--color-primary);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

input.invalid,
select.invalid,
textarea.invalid {
  border-color: var(--color-error);
  background: var(--color-error-bg);
}

input.invalid:focus,
select.invalid:focus,
textarea.invalid:focus {
  box-shadow: var(--shadow-focus-error);
}

.error {
  color: var(--color-error);
  font-size: var(--text-sm);
  font-weight: 500;
}

.hint {
  color: var(--color-text-muted);
  font-size: var(--text-xs);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-top: var(--space-2);
}

.publish,
.cancel {
  padding: var(--space-3) 28px;
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring),
    box-shadow var(--duration-fast) var(--ease-out);
}

.publish:active,
.cancel:active {
  transform: scale(0.975);
}

.publish {
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: var(--shadow-xs);
}

.publish:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.cancel {
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text);
}

.cancel:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary-border);
  color: var(--color-primary);
}
</style>
