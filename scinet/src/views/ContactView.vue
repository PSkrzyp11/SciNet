<script setup lang="ts">
import { reactive, ref } from 'vue'

const form = reactive({ name: '', email: '', message: '' })
const sent = ref(false)

function submit() {
  sent.value = true
  form.name = ''
  form.email = ''
  form.message = ''
}
</script>

<template>
  <div class="contact">
    <h1>Kontakt</h1>
    <p class="lead">Masz pytanie albo pomysł na artykuł? Napisz do nas.</p>

    <div v-if="sent" class="success">
      Dzięki! Wiadomość została wysłana.
      <button class="link" @click="sent = false">Napisz kolejną</button>
    </div>

    <form v-else @submit.prevent="submit">
      <label>
        Imię
        <input v-model="form.name" type="text" required />
      </label>
      <label>
        E-mail
        <input v-model="form.email" type="email" required />
      </label>
      <label>
        Wiadomość
        <textarea v-model="form.message" rows="5" required></textarea>
      </label>
      <button type="submit" class="btn">Wyślij</button>
    </form>
  </div>
</template>

<style scoped>
.contact {
  max-width: 520px;
  margin: 0 auto;
}

h1,
.lead {
  text-align: center;
}

h1 {
  margin: 32px 0 8px;
  color: #1f2937;
}

.lead {
  margin: 0 0 24px;
  color: #6b7280;
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 520px;
  padding: 24px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #374151;
  font-weight: 500;
}

input,
textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px #eef2ff;
}

.btn {
  align-self: flex-start;
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.btn:hover {
  background: #4338ca;
}

.success {
  max-width: 520px;
  padding: 20px 24px;
  border-radius: 12px;
  background: #ecfdf5;
  color: #065f46;
}

.link {
  margin-left: 8px;
  border: none;
  background: none;
  color: #4f46e5;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
</style>
