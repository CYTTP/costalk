<template>
  <div class="coolinput">
    <label for="input" class="text">{{ props.content }}:</label>
    <input
      :type="props.type"
      :placeholder="props.placeholder"
      name="input"
      class="input"
      :value="modelValue"
      @input="inputChange"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  modelValue: {
    type: String
  },
  type: {
    type: String
  }
})
const emit = defineEmits(['update:modelValue'])

const inputChange = (e: any) => {
  emit('update:modelValue', e.target.value)
}
</script>

<style scoped lang="scss">
.coolinput {
  display: flex;
  flex-direction: column;
  width: fit-content;
  position: static;
  max-width: 280px;
  width: 280px;
  label.text {
    font-size: 0.75rem;
    color: var(--light-accent-100);
    font-weight: 700;
    position: relative;
    top: 0.5rem;
    margin: 0 0 0 7px;
    padding: 0 3px;
    background-color: var(--login-input-bg-color);
    width: fit-content;
  }
  input[type='text'].input,
  input[type='password'].input {
    padding: 11px 10px;
    font-size: 0.75rem;
    border: 2px var(--light-accent-100) solid;
    border-radius: 5px;
    background-color: var(--login-input-bg-color);
    color: var(--login-input-text-color);
  }
  input[type='text'].input:focus,
  input[type='password'].input:focus {
    outline: none;
    caret-color: var(--login-input-caret-color);
  }
}
</style>
