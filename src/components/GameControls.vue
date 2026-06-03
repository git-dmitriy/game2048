<template>
  <div class="game-controls">
    <div v-if="!gameStarted" class="size-control">
      {{ strings.sizeLabel }}
      <template v-for="s in sizes" :key="'size-' + s">
        <input
            :id="'size-radio' + s"
            type="radio"
            :value="s"
            :checked="modelValue === s"
            @change="$emit('update:modelValue', s)"
        />
        <label :for="'size-radio' + s">{{ s }}</label>
      </template>
      &nbsp;
    </div>
    <button
        v-if="!gameStarted"
        class="button"
        @click="$emit('start')"
    >
      {{ strings.newGame }}
    </button>
    <button
        v-else
        class="button"
        @click="$emit('end')"
    >
      {{ strings.end }}
    </button>
  </div>
</template>

<script setup>
import { useStrings } from '../composables/useStrings.js'

const strings = useStrings()

defineProps({
  gameStarted: {type: Boolean, required: true},
  sizes: {type: Array, required: true},
  modelValue: {type: Number, required: true},
})

defineEmits(['update:modelValue', 'start', 'end'])
</script>

<style scoped>
.game-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: var(--controls-height);
}

.size-control {
  width: 75%;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: appearing 0.5s;
}

.size-control input[type='radio']:not(:checked) {
  position: absolute;
  opacity: 0;
}

.size-control input[type='radio'] + label {
  cursor: pointer;
  border: 5px solid var(--color-board);
  height: 30px;
  width: 30px;
  display: inline-flex;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  position: relative;
  vertical-align: middle;
  font-weight: bold;
  transition: background-color 0.3s, color 0.3s;
}

.size-control input[type='radio']:checked + label {
  background: var(--color-accent);
  color: var(--color-on-dark);
}

.button {
  background-color: var(--color-board);
  border: none;
  border-radius: 5% / 9%;
  width: 25%;
  height: 75%;
  color: var(--color-on-dark);
  outline: none;
  font-weight: bold;
  overflow: hidden;
  cursor: pointer;
  animation: appearing 0.5s;
  font-size: var(--button-font-size);
}

@keyframes appearing {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
