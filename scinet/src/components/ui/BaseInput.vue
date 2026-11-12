<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    name?: string
    type?: 'text' | 'email' | 'url' | 'search' | 'textarea'
    rows?: number
    placeholder?: string
    hint?: string
    error?: string
    errorId?: string
    required?: boolean
    disabled?: boolean
  }>(),
  {
    label: undefined,
    name: undefined,
    type: 'text',
    rows: 4,
    placeholder: undefined,
    hint: undefined,
    error: undefined,
    errorId: undefined,
    required: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="field">
    <label class="label">
      <span v-if="label" class="label-text">{{ label }}</span>
      <div class="control-wrap">
        <slot name="prefix" />
        <textarea
          v-if="type === 'textarea'"
          :value="modelValue"
          :name="name"
          :rows="rows"
          :placeholder="placeholder"
          :required="required"
          :disabled="disabled"
          :class="{ invalid: Boolean(error) }"
          :aria-invalid="Boolean(error) || undefined"
          :aria-describedby="error && errorId ? errorId : undefined"
          @input="onInput"
          @blur="emit('blur', $event)"
        ></textarea>
        <input
          v-else
          :value="modelValue"
          :type="type"
          :name="name"
          :placeholder="placeholder"
          :required="required"
          :disabled="disabled"
          :class="{ invalid: Boolean(error), 'has-prefix': Boolean($slots.prefix) }"
          :aria-invalid="Boolean(error) || undefined"
          :aria-describedby="error && errorId ? errorId : undefined"
          @input="onInput"
          @blur="emit('blur', $event)"
        />
      </div>
    </label>

    <Transition name="field-msg">
      <span v-if="error" :id="errorId" class="error" role="alert">
        {{ error }}
      </span>
      <span v-else-if="hint" class="hint">
        {{ hint }}
      </span>
    </Transition>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.label {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  color: var(--color-text-soft);
  font-size: var(--text-sm);
  font-weight: 600;
}

.control-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

input,
textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.5;
  transition:
    border-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    background-color var(--duration-fast) var(--ease-out);
}

input.has-prefix {
  padding-left: 42px;
}

textarea {
  resize: vertical;
}

input:hover:not(:disabled):not(:focus),
textarea:hover:not(:disabled):not(:focus) {
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

input.invalid:focus,
textarea.invalid:focus {
  box-shadow: var(--shadow-focus-error);
}

input:disabled,
textarea:disabled {
  opacity: 0.6;
  background: var(--color-surface-muted);
  cursor: not-allowed;
}

.error {
  color: var(--color-error);
  font-size: var(--text-sm);
  font-weight: 500;
}

.hint {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
}

.field-msg-enter-active,
.field-msg-leave-active {
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}

.field-msg-enter-from,
.field-msg-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
