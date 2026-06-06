<template>
  <div class="game-aim-header">
    <div
        ref="gameAimEl"
        class="game-aim-value"
        :class="{ 'game-aim-reached': gameAimReached }"
    >
      {{ gameAim }}
    </div>

    <div class="game-aim-links">
      <a
          class="game-aim-link"
          href="https://dmitriy-shalberkin.ru"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('website')"
      >
        <Icon :icon="personIcon" class="game-aim-link-icon" aria-hidden="true"/>
      </a>
      <a
          class="game-aim-link"
          href="https://github.com/git-dmitriy"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('githubProfile')"
      >
        <Icon :icon="githubIcon" class="game-aim-link-icon" aria-hidden="true"/>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {Icon} from '@iconify/vue'
import {useI18n} from 'vue-i18n'
import {personIcon, githubIcon} from '../icons'

const {t} = useI18n()

defineProps<{
  gameAim: number
  gameAimReached?: boolean
}>()

const gameAimEl = ref<HTMLElement | null>(null)
defineExpose({gameAimEl})
</script>

<style scoped>
.game-aim-header {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.game-aim-value {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: var(--game-aim-font-size);
  color: var(--color-text);
}

.game-aim-reached {
  text-shadow: 0 0 20px var(--color-aim-reached-glow);
  animation: pulse 1s 3;
  transition: text-shadow 3s;
}

.game-aim-links {
  display: flex;
  align-items: center;
  padding: 0.35em 0.6em;
  font-size: calc(var(--game-aim-font-size) * 0.45);
}

.game-aim-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.2em;
  color: var(--color-text);
  opacity: 0.9;
  transition: opacity 0.2s;
}

.game-aim-link:hover {
  opacity: 1;
}

.game-aim-link-icon {
  width: 1.4em;
  height: 1.4em;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
