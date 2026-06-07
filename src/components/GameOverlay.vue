<template>
  <div v-if="visible" class="overlay-wrapper">
    <div class="overlay half-white appearing-backdrop"></div>
    <div class="overlay game-over appearing">
      <p>{{ t('gameOver') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

withDefaults(defineProps<{
  visible?: boolean
}>(), {
  visible: false,
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
  background-color: var(--color-overlay);
}

.game-over {
  font-weight: bold;
  text-align: center;
  font-size: var(--game-over-font-size);
  color: var(--color-text);
}

.appearing {
  animation: appearing var(--motion-slow) var(--motion-ease);
}

.appearing-backdrop {
  animation: appearing-backdrop var(--motion-slow) var(--motion-ease);
}
</style>
