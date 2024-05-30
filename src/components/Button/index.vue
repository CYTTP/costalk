<template>
  <button :style="{ width: props.width + 'px' }">{{ props.content }}</button>
</template>

<script setup lang="ts">
import { ref, defineProps } from "vue";
const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  width: {
    type: Number,
    default: 280,
  },
});
</script>

<style scoped lang="scss">
button {
  --c: #fff;
  /* text color */
  background: linear-gradient(90deg, #0000 33%, #fff5, #0000 67%)
      var(--_p, 100%) / 300% no-repeat,
    var(--light-primary-100);
  /* background color */
  color: #0000;
  border: none;
  transform: perspective(500px) rotateY(calc(0deg * var(--_i, -1)));
  text-shadow: calc(var(--_i, -1) * 0.08em) -0.01em 0 var(--c),
    calc(var(--_i, -1) * -0.08em) 0.01em 2px #0004;
  outline-offset: 0.1em;
  transition: 0.3s;
  width: 280px;
  height: 50px;
  margin-top: 5px;
  font-family: system-ui, sans-serif;
  font-weight: bold;
  font-size: 2rem;
  margin-top: 7px;
  cursor: pointer;
  padding: 0.1em 0.3em;
  border-radius: 5px;
}

button:hover,
button:focus-visible {
  --_p: 0%;
  --_i: 1;
}

button:active {
  text-shadow: none;
  color: var(--c);
  box-shadow: inset 0 0 9e9Q #0005;
  transition: 0s;
}
</style>
