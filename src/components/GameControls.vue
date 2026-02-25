<template>
  <div class="game-controls" :style="controlsStyle">
    <div v-if="!gameStarted" class="size-control">
      Size:
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
      :style="buttonStyle"
      @click="$emit('start')"
    >
      New Game
    </button>
    <button
      v-else
      class="button"
      :style="buttonStyle"
      @click="$emit('end')"
    >
      End
    </button>
  </div>
</template>

<script setup>
defineProps({
  gameStarted: { type: Boolean, required: true },
  sizes: { type: Array, required: true },
  modelValue: { type: Number, required: true },
  controlsStyle: { type: Object, default: () => ({}) },
  buttonStyle: { type: Object, default: () => ({}) }
})

defineEmits(['update:modelValue', 'start', 'end'])
</script>

<style scoped>
.game-controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
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
  border: 5px solid #35495e;
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
  background: #41b883;
  color: white;
}

.button {
  background-color: #35495e;
  border: none;
  border-radius: 5% / 9%;
  width: 25%;
  height: 75%;
  color: white;
  outline: none;
  font-weight: bold;
  overflow: hidden;
  cursor: pointer;
  animation: appearing 0.5s;
}

@keyframes appearing {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
</style>
