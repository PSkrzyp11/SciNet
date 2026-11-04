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

// Formularz nie zna store'a: gotowe dane przekazuje rodzicowi przez emit
const emit = defineEmits<{ publish: [draft: ArticleDraft]; cancel: [] }>()

const form = reactive({
  title: '',
  author: currentUser.name,
  category: '' as Category | '',
  content: '',
  image: '',
})
const touched = reactive({
  title: false,
  author: false,
  category: false,
  content: false,
  image: false,
})
const formElement = ref<HTMLFormElement | null>(null)

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

  emit('publish', {
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
    <h2>Nowy artykuł</h2>

    <div class="field">
      <label>
        Tytuł
        <input v-model="form.title" type="text" required v-bind="fieldAttrs('title')" />
      </label>
      <span v-if="visibleError('title')" id="article-title-error" class="error">
        {{ visibleError('title') }}
      </span>
    </div>

    <div class="row">
      <div class="field">
        <label>
          Autor
          <input v-model="form.author" type="text" required v-bind="fieldAttrs('author')" />
        </label>
        <span v-if="visibleError('author')" id="article-author-error" class="error">
          {{ visibleError('author') }}
        </span>
      </div>

      <div class="field">
        <label>
          Dziedzina nauki
          <select v-model="form.category" required v-bind="fieldAttrs('category')">
            <option value="" disabled>Wybierz dziedzinę</option>
            <option v-for="category in CATEGORIES" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </label>
        <span v-if="visibleError('category')" id="article-category-error" class="error">
          {{ visibleError('category') }}
        </span>
      </div>
    </div>

    <div class="field">
      <label>
        Treść
        <textarea
          v-model="form.content"
          rows="8"
          required
          v-bind="fieldAttrs('content')"
        ></textarea>
      </label>
      <span v-if="visibleError('content')" id="article-content-error" class="error">
        {{ visibleError('content') }}
      </span>
      <span v-else class="hint">Akapity oddziel pustą linią.</span>
    </div>

    <div class="field">
      <label>
        Adres obrazka (opcjonalnie)
        <input
          v-model="form.image"
          type="url"
          placeholder="https://"
          v-bind="fieldAttrs('image')"
        />
      </label>
      <span v-if="visibleError('image')" id="article-image-error" class="error">
        {{ visibleError('image') }}
      </span>
      <span v-else class="hint">Podaj adres obrazka z internetu, nie plik z komputera.</span>
    </div>

    <!-- Bez blur przy wciśnięciu myszy błąd adresu nie przesuwa przycisków w trakcie klikania -->
    <div class="actions">
      <button type="submit" class="publish" @mousedown.prevent>Opublikuj</button>
      <button type="button" class="cancel" @mousedown.prevent @click="emit('cancel')">
        Anuluj
      </button>
    </div>
  </form>
</template>

<style scoped>
.article-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
  padding: 28px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

h2 {
  margin: 0;
  font-size: 1.4rem;
}

.row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

@media (max-width: 560px) {
  .row {
    grid-template-columns: minmax(0, 1fr);
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--color-text-soft);
  font-weight: 500;
}

input,
select,
textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--color-input-border);
  border-radius: 10px;
  transition: border-color 0.2s;
}

textarea {
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

input.invalid,
select.invalid,
textarea.invalid {
  border-color: var(--color-error);
}

.error {
  color: var(--color-error);
  font-size: 0.9rem;
}

.hint {
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.publish,
.cancel {
  padding: 12px 28px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.publish {
  border: 1px solid var(--color-button);
  background: var(--color-button);
  color: #fff;
}

.publish:hover {
  background: var(--color-button-hover);
}

.cancel {
  border: 1px solid var(--color-border);
  background: none;
  color: var(--color-text);
}

.cancel:hover {
  background: var(--color-hover);
}
</style>
