<template>
  <div class="score-container" :style="containerStyle">
    <div
      ref="gameAimEl"
      class="game-aim"
      :class="{ 'game-aim-reached': gameAimReached }"
      :style="gameAimStyle"
    >
      {{ gameAim }}
    </div>
    <div class="scores" :style="scoreStyle">
      <div class="score">
        <div class="label">Score</div>
        <div>
          {{ score }}
          <Transition name="score-inc">
            <span v-if="scoreInc !== ''" class="score-inc">{{ scoreInc }}</span>
          </Transition>
        </div>
      </div>
      &nbsp;
      <div class="score">
        <div class="label">Best</div>
        <div>{{ bestScore }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  score: { type: Number, required: true },
  scoreInc: { type: String, default: '' },
  bestScore: { type: Number, required: true },
  gameAim: { type: Number, required: true },
  gameAimReached: { type: Boolean, default: false },
  containerStyle: { type: Object, default: () => ({}) },
  gameAimStyle: { type: Object, default: () => ({}) },
  scoreStyle: { type: Object, default: () => ({}) }
})

const gameAimEl = ref(null)
defineExpose({ gameAimEl })
</script>

<style scoped>
.score-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-aim {
  font-weight: bold;
  font-size: 4em;
  text-align: center;
  color: white;
  background-color: #35495e;
  border-radius: 5% / 9%;
  width: 38%;
}

.game-aim-reached {
  text-shadow: 0 0 20px;
  animation: pulse 1s 3;
  -webkit-animation: pulse 1s 3;
  transition: text-shadow 3s;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.scores {
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  width: 50%;
}

.score {
  position: relative;
  text-align: center;
  color: white;
  background-color: #9aa4af;
  border-radius: 5% / 8%;
  width: 50%;
  padding-top: 2%;
}

.score-inc {
  position: absolute;
  left: 0;
  color: #2c3e50;
  width: 100%;
  animation: up-disappear 1.5s;
}

.score .label {
  color: white;
  font-size: 1rem;
}

@keyframes up-disappear {
  0% { opacity: 0.7; }
  100% { opacity: 0; transform: translateY(-40px); }
}
</style>
