<template>
  <Teleport to="body">
    <div v-if="visible" class="pwa-install" role="dialog" aria-modal="true" :aria-labelledby="titleId">
      <div class="pwa-install-backdrop" @click="dismiss"/>

      <div class="pwa-install-dialog" @click.stop>
        <h2 :id="titleId" class="pwa-install-title">{{ t('pwaInstallTitle') }}</h2>
        <ol class="pwa-install-steps">
          <li>{{ t('pwaInstallStep1') }}</li>
          <li>{{ t('pwaInstallStep2') }}</li>
          <li>{{ t('pwaInstallStep3') }}</li>
        </ol>
        <button type="button" class="pwa-install-button" @click="dismiss">
          {{ t('pwaInstallGotIt') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {usePwaInstall} from '../composables/usePwaInstall'

const {t} = useI18n()
const {visible, dismiss} = usePwaInstall()

const titleId = 'pwa-install-title'
</script>

<style scoped>
.pwa-install {
  position: fixed;
  inset: 0;
  z-index: 950;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.pwa-install-backdrop {
  position: absolute;
  inset: 0;
  background-color: var(--color-overlay);
}

.pwa-install-dialog {
  position: relative;
  z-index: 1;
  width: min(100%, 360px);
  padding: 1.25rem;
  border-radius: 12px;
  background-color: var(--color-bg);
  color: var(--color-text);
  box-shadow: 0 8px 32px var(--color-shadow);
  animation: pwa-install-appear 0.25s ease-out;
}

.pwa-install-title {
  margin: 0 0 0.85rem;
  font-size: calc(var(--button-font-size) * 0.95);
  font-weight: bold;
  text-align: center;
}

.pwa-install-steps {
  margin: 0 0 1rem;
  padding-left: 1.25rem;
  font-size: calc(var(--button-font-size) * 0.75);
  line-height: 1.45;
}

.pwa-install-steps li + li {
  margin-top: 0.45rem;
}

.pwa-install-button {
  width: 100%;
  min-height: 2.5rem;
  border: none;
  border-radius: 8px;
  background-color: var(--color-accent);
  color: var(--color-on-dark);
  font-weight: bold;
  font-size: calc(var(--button-font-size) * 0.8);
  cursor: pointer;
}

@keyframes pwa-install-appear {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
