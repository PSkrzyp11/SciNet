<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import AuthorAvatar from '@/components/AuthorAvatar.vue'
import { useToast } from '@/composables/useToast'
import type { ArticleComment, CommentDraft } from '@/data/articles'
import { currentUser } from '@/data/authors'

defineProps<{ comments: ArticleComment[] }>()

// Sekcja nie zna store'a: nowy komentarz przekazuje rodzicowi przez emit
const emit = defineEmits<{ add: [comment: CommentDraft] }>()

const { notify } = useToast()

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
  notify('Dodano komentarz', {
    description: 'Twój głos został dołączony do dyskusji.',
    variant: 'success',
    duration: 2800,
  })
}
</script>

<template>
  <section class="comments">
    <h2>Komentarze ({{ comments.length }})</h2>

    <TransitionGroup v-if="comments.length" name="comment-list" tag="ul">
      <li v-for="comment in comments" :key="comment.id">
        <div class="head">
          <div class="author-cell">
            <AuthorAvatar :name="comment.author" :size="32" />
            <strong>{{ comment.author }}</strong>
          </div>
          <span class="date">{{ formatDate(comment.date) }}</span>
        </div>
        <p class="text">{{ comment.text }}</p>
      </li>
    </TransitionGroup>
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
        <span v-if="errors.author" id="comment-author-error" class="error" role="alert">
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
            placeholder="Dołącz do dyskusji naukowej…"
            required
            :class="{ invalid: errors.text }"
            :aria-invalid="Boolean(errors.text) || undefined"
            :aria-describedby="errors.text ? 'comment-text-error' : undefined"
          ></textarea>
        </label>
        <span v-if="errors.text" id="comment-text-error" class="error" role="alert">
          {{ errors.text }}
        </span>
      </div>

      <button type="submit" class="add-comment">Dodaj komentarz</button>
    </form>
  </section>
</template>

<style scoped>
.comments {
  margin-top: var(--space-9);
  padding-top: var(--space-7);
  border-top: 1px solid var(--color-border);
}

h2 {
  margin-bottom: var(--space-4);
  font-family: var(--font-display);
  font-size: var(--text-xl);
}

ul {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin: 0 0 var(--space-6);
  padding: 0;
  list-style: none;
}

li {
  padding: var(--space-4) var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--duration-fast) var(--ease-out);
}

li:hover {
  border-color: var(--color-primary-border);
}

.head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2) var(--space-3);
  margin-bottom: var(--space-2);
}

.author-cell {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

.date {
  flex-shrink: 0;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}

.text {
  margin: 0;
  color: var(--color-text-soft);
  line-height: 1.55;
  /* Pojedynczy Enter wpisany w komentarzu jest nową linią */
  white-space: pre-line;
}

.comment-list-enter-active,
.comment-list-leave-active {
  transition:
    opacity var(--duration-normal) var(--ease-out),
    transform var(--duration-normal) var(--ease-spring);
}

.comment-list-enter-from,
.comment-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.empty {
  margin: 0 0 var(--space-6);
  padding: var(--space-5);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius);
  background: var(--color-bg-subtle);
  color: var(--color-text-muted);
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-xs);
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

input,
textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  font-weight: 400;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

textarea {
  resize: vertical;
}

input:hover:not(:focus),
textarea:hover:not(:focus) {
  border-color: var(--color-primary);
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--shadow-focus);
}

input.invalid,
textarea.invalid {
  border-color: var(--color-error);
  background: var(--color-error-bg);
}

.error {
  color: var(--color-error);
  font-size: var(--text-sm);
  font-weight: 500;
}

.add-comment {
  align-self: flex-start;
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: var(--color-on-primary);
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-xs);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-spring),
    box-shadow var(--duration-fast) var(--ease-out);
}

.add-comment:hover {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.add-comment:active {
  transform: scale(0.975);
}
</style>
