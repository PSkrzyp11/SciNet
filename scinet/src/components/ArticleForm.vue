<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import {
  CATEGORIES,
  isImageUrl,
  toParagraphs,
  type ArticleDraft,
  type Category,
} from '@/data/articles'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { currentUser } from '@/data/authors'

type Field = 'title' | 'author' | 'category' | 'content' | 'image'

// Napis z „//” wpisany wprost w szablon psuje sprawdzanie typów (vue-tsc), więc jest tutaj
const IMAGE_PLACEHOLDER = 'https://'

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

// Wspólne ustawienia pola: nazwa, błąd i jego identyfikator dla czytnika ekranu
function fieldProps(field: Field) {
  return { name: field, error: visibleError(field), errorId: `article-${field}-error` }
}

function touch(field: Field) {
  if (form[field].trim()) touched[field] = true
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

    <BaseInput
      v-model="form.title"
      label="Tytuł"
      placeholder="Np. Jak grzyby komunikują się pod ziemią?"
      required
      v-bind="fieldProps('title')"
      @blur="touch('title')"
    />

    <div class="row">
      <BaseInput
        v-model="form.author"
        label="Autor"
        required
        v-bind="fieldProps('author')"
        @blur="touch('author')"
      />

      <BaseInput
        v-model="form.category"
        type="select"
        label="Dziedzina nauki"
        required
        v-bind="fieldProps('category')"
        @blur="touch('category')"
      >
        <option value="" disabled>Wybierz dziedzinę</option>
        <option v-for="category in CATEGORIES" :key="category" :value="category">
          {{ category }}
        </option>
      </BaseInput>
    </div>

    <BaseInput
      v-model="form.content"
      type="textarea"
      label="Treść"
      :rows="8"
      placeholder="Wyjaśnij zagadnienie krok po kroku…"
      hint="Akapity oddziel pustą linią."
      required
      v-bind="fieldProps('content')"
      @blur="touch('content')"
    >
      <template #label-aside>
        <span class="word-counter" aria-hidden="true">{{ wordCount }} słów</span>
      </template>
    </BaseInput>

    <BaseInput
      v-model="form.image"
      type="url"
      label="Adres obrazka (opcjonalnie)"
      :placeholder="IMAGE_PLACEHOLDER"
      hint="Podaj adres obrazka z internetu, nie plik z komputera."
      v-bind="fieldProps('image')"
      @blur="touch('image')"
    />

    <!-- Bez blur przy wciśnięciu myszy błąd adresu nie przesuwa przycisków w trakcie klikania -->
    <div class="actions">
      <BaseButton type="submit" class="publish" @mousedown.prevent>
        {{ initial ? 'Zapisz zmiany' : 'Opublikuj' }}
      </BaseButton>
      <BaseButton variant="secondary" class="cancel" @mousedown.prevent @click="emit('cancel')">
        Anuluj
      </BaseButton>
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

.word-counter {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-muted);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding-top: var(--space-2);
}
</style>
