<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import type { ArticleComment, CommentDraft } from '@/data/articles'
import { currentUser } from '@/data/authors'

defineProps<{ comments: ArticleComment[] }>()

// Sekcja nie zna store'a: nowy komentarz przekazuje rodzicowi przez emit
const emit = defineEmits<{ add: [comment: CommentDraft] }>()

const form = reactive({ author: currentUser.name, text: '' })
const submitted = ref(false)
const formElement = ref<HTMLFormElement | null>(null)

// Błędy widać dopiero po próbie dodania komentarza
const errors = computed(() => ({
  author: submitted.value && !form.author.trim() ? 'Podaj autora komentarza.' : '',
  text: submitted.value && !form.text.trim() ? 'Napisz treść komentarza.' : '',
}))

const formatDate = (date: string) => new Date(date).toLocaleDateString('pl-PL')

async function submit() {
  submitted.value = true

  if (errors.value.author || errors.value.text) {
    await nextTick()
    formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }

  emit('add', { author: form.author.trim(), text: form.text.trim() })
  form.text = ''
  submitted.value = false
}
</script>

<template>
  <section class="comments">
    <h2>Komentarze ({{ comments.length }})</h2>

    <ul v-if="comments.length">
      <li v-for="comment in comments" :key="comment.id">
        <div class="head">
          <strong>{{ comment.author }}</strong>
          <span class="date">{{ formatDate(comment.date) }}</span>
        </div>
        <p class="text">{{ comment.text }}</p>
      </li>
    </ul>
    <p v-else class="empty">Nikt jeszcze nie skomentował tego artykułu.</p>

    <form ref="formElement" novalidate @submit.prevent="submit">
      <div class="field">
        <label>
          Autor
          <input
            v-model="form.author"
            type="text"
            name="author"
            required
            :class="{ invalid: errors.author }"
            :aria-invalid="Boolean(errors.author) || undefined"
            :aria-describedby="errors.author ? 'comment-author-error' : undefined"
          />
        </label>
        <span v-if="errors.author" id="comment-author-error" class="error">
          {{ errors.author }}
        </span>
      </div>

      <div class="field">
        <label>
          Komentarz
          <textarea
            v-model="form.text"
            name="text"
            rows="3"
            required
            :class="{ invalid: errors.text }"
            :aria-invalid="Boolean(errors.text) || undefined"
            :aria-describedby="errors.text ? 'comment-text-error' : undefined"
          ></textarea>
        </label>
        <span v-if="errors.text" id="comment-text-error" class="error">{{ errors.text }}</span>
      </div>

      <button type="submit" class="add-comment">Dodaj komentarz</button>
    </form>
  </section>
</template>

<style scoped>
.comments {
  margin-top: 48px;
}

h2 {
  margin-bottom: 16px;
  font-size: 1.4rem;
}

ul {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 0 24px;
  padding: 0;
  list-style: none;
}

li {
  padding: 16px 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
  margin-bottom: 6px;
}

.date {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.text {
  margin: 0;
  /* Pojedynczy Enter wpisany w komentarzu jest nową linią */
  white-space: pre-line;
}

.empty {
  margin: 0 0 24px;
  color: var(--color-text-muted);
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
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
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

input.invalid,
textarea.invalid {
  border-color: var(--color-error);
}

.error {
  color: var(--color-error);
  font-size: 0.9rem;
}

.add-comment {
  align-self: flex-start;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.add-comment:hover {
  background: var(--color-primary-hover);
}
</style>
