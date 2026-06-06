<template>
  <div class="game-toolbar">
    <div class="toolbar-item score-box">
      <div class="score-label">{{ t('score') }}</div>
      <div class="score-value">
        {{ score }}
        <Transition name="score-inc">
          <span v-if="scoreInc !== ''" class="score-inc">{{ scoreInc }}</span>
        </Transition>
      </div>
    </div>

    <div class="toolbar-item score-box">
      <div class="score-label">{{ t('best') }}</div>
      <div class="score-value">{{ bestScore }}</div>
    </div>

    <button
        type="button"
        class="toolbar-item toolbar-button toolbar-settings"
        :aria-label="t('settings')"
        @click="$emit('open-settings')"
    >
      <Icon :icon="settingsIcon" class="icon-gear" aria-hidden="true"/>
    </button>

    <button
        v-if="!gameStarted"
        type="button"
        class="toolbar-item toolbar-button toolbar-primary"
        :class="{ 'toolbar-primary--hint': highlightStart }"
        @click="$emit('start')"
    >
      {{ t('newGame') }}
    </button>
    <button
        v-else
        type="button"
        class="toolbar-item toolbar-button toolbar-primary"
        @click="$emit('end')"
    >
      {{ t('end') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {Icon} from '@iconify/vue'
import {settingsIcon} from '../icons'

const {t} = useI18n()

withDefaults(defineProps<{
  score: number
  scoreInc?: string
  bestScore: number
  gameStarted: boolean
  highlightStart?: boolean
}>(), {
  scoreInc: '',
  highlightStart: false,
})

defineEmits<{
  'open-settings': []
  start: []
  end: []
}>()
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
  font-size: 1.4rem;
  background-color: var(--color-board);
  color: var(--color-on-dark);
}

.toolbar-primary {
  background-color: var(--color-board);
  color: var(--color-on-dark);
}

.toolbar-primary--hint {
  animation: start-hint-pulse 1.2s ease-in-out 4;
}

@keyframes start-hint-pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 transparent;
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 55%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .toolbar-primary--hint {
    animation: none;
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
}

.icon-gear {
  width: 1.35em;
  height: 1.35em;
  flex-shrink: 0;
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
