<template>
  <div class="score-container">
    <div
        ref="gameAimEl"
        class="game-aim"
        :class="{ 'game-aim-reached': gameAimReached }"
    >
      {{ gameAim }}
    </div>
    <div class="scores">
      <div class="score">
        <div class="label">{{ strings.score }}</div>
        <div>
          {{ score }}
          <Transition name="score-inc">
            <span v-if="scoreInc !== ''" class="score-inc">{{ scoreInc }}</span>
          </Transition>
        </div>
      </div>
      &nbsp;
      <div class="score">
        <div class="label">{{ strings.best }}</div>
        <div>{{ bestScore }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import {useStrings} from '../composables/useStrings.js'

const strings = useStrings()

defineProps({
  score: {type: Number, required: true},
  scoreInc: {type: String, default: ''},
  bestScore: {type: Number, required: true},
  gameAim: {type: Number, required: true},
  gameAimReached: {type: Boolean, default: false},
})

const gameAimEl = ref(null)
defineExpose({gameAimEl})
</script>

<style scoped>
.score-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--score-panel-height);
}

.game-aim {
  font-weight: bold;
  font-size: var(--game-aim-font-size);
  text-align: center;
  color: var(--color-on-dark);
  background-color: var(--color-board);
  border-radius: 5% / 9%;
  width: 38%;
  box-shadow: var(--game-aim-shadow);
}

.game-aim-reached {
  text-shadow: 0 0 20px;
  animation: pulse 1s 3;
  transition: text-shadow 3s;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.scores {
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  width: 50%;
  font-size: var(--score-font-size);
}

.score {
  position: relative;
  text-align: center;
  color: var(--color-on-dark);
  background-color: var(--color-panel);
  border-radius: 5% / 8%;
  width: 50%;
  padding-top: 2%;
}

.score-inc {
  position: absolute;
  left: 0;
  color: var(--color-score-inc);
  width: 100%;
  animation: up-disappear 1.5s;
}

.score .label {
  color: var(--color-on-dark);
  font-size: 1rem;
}

@keyframes up-disappear {
  0% {
    opacity: 0.7;
  }
  100% {
    opacity: 0;
    transform: translateY(-40px);
  }
}
</style>
