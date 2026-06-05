<template>
  <div class="game-toolbar">
    <div class="toolbar-item score-box">
      <div class="score-label">{{ strings.score }}</div>
      <div class="score-value">
        {{ score }}
        <Transition name="score-inc">
          <span v-if="scoreInc !== ''" class="score-inc">{{ scoreInc }}</span>
        </Transition>
      </div>
    </div>

    <div class="toolbar-item score-box">
      <div class="score-label">{{ strings.best }}</div>
      <div class="score-value">{{ bestScore }}</div>
    </div>

    <button
        type="button"
        class="toolbar-item toolbar-button toolbar-settings"
        @click="$emit('open-settings')"
    >
      <Icon :icon="settingsIcon" class="icon-gear" aria-hidden="true"/>
      <span class="button-label">{{ strings.settings }}</span>
    </button>

    <button
        v-if="!gameStarted"
        type="button"
        class="toolbar-item toolbar-button toolbar-primary"
        @click="$emit('start')"
    >
      {{ strings.newGame }}
    </button>
    <button
        v-else
        type="button"
        class="toolbar-item toolbar-button toolbar-primary"
        @click="$emit('end')"
    >
      {{ strings.end }}
    </button>
  </div>
</template>

<script setup>
import {Icon} from '@iconify/vue'
import {useStrings} from '../composables/useStrings.js'
import {settingsIcon} from '../icons.js'

const strings = useStrings()

defineProps({
  score: {type: Number, required: true},
  scoreInc: {type: String, default: ''},
  bestScore: {type: Number, required: true},
  gameStarted: {type: Boolean, required: true},
})

defineEmits(['open-settings', 'start', 'end'])
</script>

<style scoped>
.game-toolbar {
  display: flex;
  align-items: stretch;
  gap: 2%;
  width: 100%;
  height: 100%;
}

.toolbar-item {
  flex: 1;
  min-width: 0;
}

.score-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-on-dark);
  background-color: var(--color-panel);
  border-radius: 8px;
  padding: 4% 2%;
  font-weight: bold;
  font-size: var(--score-font-size);
}

.score-label {
  color: var(--color-score-label);
  font-size: calc(var(--score-font-size) * 0.55);
  line-height: 1.2;
}

.score-value {
  position: relative;
  line-height: 1.2;
}

.score-inc {
  position: absolute;
  left: 0;
  width: 100%;
  color: var(--color-score-inc);
  animation: up-disappear 1.5s;
}

.toolbar-button {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2em;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: var(--button-font-size);
  cursor: pointer;
  padding: 4% 2%;
}

.toolbar-settings {
  background-color: var(--color-panel);
  color: var(--color-text);
}

.toolbar-primary {
  background-color: var(--color-board);
  color: var(--color-on-dark);
}

.icon-gear {
  width: 1.2em;
  height: 1.2em;
  flex-shrink: 0;
}

.button-label {
  font-size: calc(var(--button-font-size) * 0.7);
  line-height: 1.1;
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
