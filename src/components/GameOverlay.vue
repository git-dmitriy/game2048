<template>
  <div v-if="visible" class="overlay-wrapper">
    <div class="overlay half-white appearing07"></div>
    <div class="overlay game-over appearing" :style="gameOverStyle">
      <p>Game over!</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  gameOverStyle: { type: Object, default: () => ({}) }
})
</script>

<style scoped>
.overlay-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay {
  width: 100%;
  height: 100%;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
}

.half-white {
  background-color: white;
  opacity: 0.7;
}

.game-over {
  font-weight: bold;
  text-align: center;
}

.appearing {
  animation: appearing 1s;
}

.appearing07 {
  animation: appearing07 1s;
}

@keyframes appearing {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes appearing07 {
  0% { opacity: 0; }
  100% { opacity: 0.7; }
}
</style>
