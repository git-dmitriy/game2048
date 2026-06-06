<template>
  <div v-if="showPrompt()" class="pwa-update" role="status">
    <p class="pwa-update-text">{{ t('pwaUpdateAvailable') }}</p>
    <div class="pwa-update-actions">
      <button type="button" class="pwa-update-button pwa-update-later" @click="dismiss">
        {{ t('pwaLater') }}
      </button>
      <button type="button" class="pwa-update-button pwa-update-apply" @click="applyUpdate">
        {{ t('pwaUpdate') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import {useI18n} from 'vue-i18n'
import {usePwaUpdate} from '../composables/usePwaUpdate.js'

const {t} = useI18n()
const {showPrompt, dismiss, applyUpdate} = usePwaUpdate()
</script>

<style scoped>
.pwa-update {
  position: fixed;
  left: 50%;
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 900;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: min(calc(100vw - 2rem), 360px);
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background-color: var(--color-bg);
  color: var(--color-text);
  box-shadow: 0 8px 24px var(--color-shadow);
  transform: translateX(-50%);
  animation: pwa-update-appear 0.25s ease-out;
}

.pwa-update-text {
  margin: 0;
  font-size: calc(var(--button-font-size) * 0.8);
  line-height: 1.35;
  text-align: center;
}

.pwa-update-actions {
  display: flex;
  gap: 0.5rem;
}

.pwa-update-button {
  flex: 1;
  min-height: 2.25rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: calc(var(--button-font-size) * 0.75);
  cursor: pointer;
}

.pwa-update-later {
  background-color: var(--color-panel);
  color: var(--color-text);
}

.pwa-update-apply {
  background-color: var(--color-accent);
  color: var(--color-on-dark);
}

@keyframes pwa-update-appear {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}
</style>
