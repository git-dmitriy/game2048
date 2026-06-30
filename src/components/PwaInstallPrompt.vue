<template>
  <Teleport to="body">
    <div
        v-if="visible && mode === 'ios'"
        class="pwa-install pwa-install-ios"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="iosTitleId"
    >
      <div class="pwa-install-backdrop" @click="dismiss"/>

      <div class="pwa-install-dialog" @click.stop>
        <h2 :id="iosTitleId" class="pwa-install-title">{{ t('pwaInstallTitle') }}</h2>
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

    <div
        v-else-if="visible && mode === 'chromium'"
        class="pwa-install-chromium"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="chromiumTitleId"
    >
      <h2 :id="chromiumTitleId" class="pwa-install-chromium-title">
        {{ t('pwaInstallAndroidTitle') }}
      </h2>
      <p class="pwa-install-chromium-text">{{ t('pwaInstallAndroidMessage') }}</p>
      <div class="pwa-install-chromium-actions">
        <button type="button" class="pwa-install-chromium-button pwa-install-later" @click="dismiss">
          {{ t('pwaInstallAndroidLater') }}
        </button>
        <button
            type="button"
            class="pwa-install-chromium-button pwa-install-apply"
            :disabled="!canInstall"
            @click="install"
        >
          {{ t('pwaInstallAndroidInstall') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n'
import {usePwaInstall} from '../composables/usePwaInstall'

const {t} = useI18n()
const {visible, mode, canInstall, dismiss, install} = usePwaInstall()

const iosTitleId = 'pwa-install-ios-title'
const chromiumTitleId = 'pwa-install-chromium-title'
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
  animation: dialog-appear var(--motion-modal) var(--motion-ease);
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

.pwa-install-chromium {
  position: fixed;
  left: 50%;
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 905;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: min(calc(100vw - 2rem), 360px);
  padding: 0.85rem 1rem;
  border-radius: 12px;
  background-color: var(--color-bg);
  color: var(--color-text);
  box-shadow: 0 8px 24px var(--color-shadow);
  transform: translateX(-50%);
  animation: dialog-appear-centered var(--motion-modal) var(--motion-ease);
}

.pwa-install-chromium-title {
  margin: 0;
  font-size: calc(var(--button-font-size) * 0.85);
  font-weight: bold;
  text-align: center;
}

.pwa-install-chromium-text {
  margin: 0;
  font-size: calc(var(--button-font-size) * 0.75);
  line-height: 1.35;
  text-align: center;
}

.pwa-install-chromium-actions {
  display: flex;
  gap: 0.5rem;
}

.pwa-install-chromium-button {
  flex: 1;
  min-height: 2.25rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: calc(var(--button-font-size) * 0.75);
  cursor: pointer;
}

.pwa-install-later {
  background-color: var(--color-panel);
  color: var(--color-text);
}

.pwa-install-apply {
  background-color: var(--color-accent);
  color: var(--color-on-dark);
}

.pwa-install-apply:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
