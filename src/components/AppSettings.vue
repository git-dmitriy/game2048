<template>
  <Teleport to="body">
    <div v-if="visible" class="settings-modal">
      <div class="settings-backdrop" @click="requestClose"/>

      <div
          class="settings-dialog"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          @click.stop
      >
        <header class="settings-header">
          <h2 :id="titleId" class="settings-title">{{ t('settings') }}</h2>
          <button
              type="button"
              class="settings-close"
              :aria-label="t('cancel')"
              @click="requestClose"
          >
            <Icon :icon="closeIcon" class="icon-close" aria-hidden="true"/>
          </button>
        </header>

        <section class="settings-section">
          <h3 class="settings-label">{{ t('language') }}</h3>
          <div class="option-group">
            <template v-for="localeId in localeOptions" :key="'locale-' + localeId">
              <input
                  :id="'settings-locale-' + localeId"
                  v-model="draftLocale"
                  type="radio"
                  name="locale"
                  :value="localeId"
              />
              <label :for="'settings-locale-' + localeId">{{ localeId.toUpperCase() }}</label>
            </template>
          </div>
        </section>

        <section class="settings-section">
          <h3 class="settings-label">{{ t('sound') }}</h3>
          <div class="option-group">
            <input
                id="settings-sound-on"
                v-model="draftSoundEnabled"
                type="radio"
                name="sound"
                :value="true"
            />
            <label for="settings-sound-on">{{ t('soundOn') }}</label>
            <input
                id="settings-sound-off"
                v-model="draftSoundEnabled"
                type="radio"
                name="sound"
                :value="false"
            />
            <label for="settings-sound-off">{{ t('soundOff') }}</label>
          </div>
        </section>

        <section class="settings-section">
          <h3 class="settings-label">{{ t('boardSize') }}</h3>
          <div class="option-group">
            <template v-for="s in sizes" :key="'size-' + s">
              <input
                  :id="'settings-size-' + s"
                  v-model="draftSize"
                  type="radio"
                  name="board-size"
                  :value="s"
              />
              <label :for="'settings-size-' + s">{{ s }}×{{ s }}</label>
            </template>
          </div>
        </section>

        <section class="settings-section">
          <h3 class="settings-label">{{ t('colorScheme') }}</h3>
          <div class="option-group option-group-themes">
            <template v-for="theme in themes" :key="theme.id">
              <input
                  :id="'settings-theme-' + theme.id"
                  v-model="draftTheme"
                  type="radio"
                  name="color-theme"
                  :value="theme.id"
              />
              <label :for="'settings-theme-' + theme.id" class="theme-option">
                <span class="theme-indicator" aria-hidden="true">
                  <span
                      v-for="(color, i) in theme.indicator"
                      :key="theme.id + '-swatch-' + i"
                      class="theme-swatch"
                      :style="{ backgroundColor: color }"
                  />
                </span>
                <span class="theme-label">{{ t(theme.labelKey) }}</span>
              </label>
            </template>
          </div>
        </section>

        <button type="button" class="settings-save" @click="onSaveClick">
          {{ t('save') }}
        </button>

        <div v-if="showResetConfirm" class="confirm-overlay" @click.stop>
          <div class="confirm-dialog">
            <p class="confirm-message">{{ t('settingsResetWarning') }}</p>
            <div class="confirm-actions">
              <button type="button" class="confirm-button confirm-cancel" @click="showResetConfirm = false">
                {{ t('cancel') }}
              </button>
              <button type="button" class="confirm-button confirm-ok" @click="confirmSave">
                {{ t('confirm') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {useI18n} from 'vue-i18n'
import {Icon} from '@iconify/vue'
import {closeIcon} from '../icons'
import {UI_THEMES, normalizeUiThemeId} from '../config/themes'
import {LOCALE_OPTIONS, normalizeLocale} from '../i18n'
import type {LocaleId, UiThemeId} from '../types/game'
import type {SettingsSavePayload} from '../types/settings'

const {t} = useI18n()
const themes = UI_THEMES
const localeOptions = LOCALE_OPTIONS
const titleId = 'app-settings-title'

const props = withDefaults(defineProps<{
  visible?: boolean
  sizes: number[]
  boardSize: number
  colorTheme: UiThemeId | string
  locale: LocaleId | string
  soundEnabled?: boolean
  gameStarted?: boolean
}>(), {
  visible: false,
  gameStarted: false,
  soundEnabled: true,
})

const emit = defineEmits<{
  close: []
  save: [payload: SettingsSavePayload]
}>()

const draftSize = ref(props.boardSize)
const draftTheme = ref(normalizeUiThemeId(props.colorTheme))
const draftLocale = ref(normalizeLocale(props.locale))
const draftSoundEnabled = ref(props.soundEnabled)
const showResetConfirm = ref(false)

watch(() => props.visible, (open) => {
  if (!open) {
    showResetConfirm.value = false
    return
  }
  draftSize.value = props.boardSize
  draftTheme.value = normalizeUiThemeId(props.colorTheme)
  draftLocale.value = normalizeLocale(props.locale)
  draftSoundEnabled.value = props.soundEnabled
})

function requestClose() {
  showResetConfirm.value = false
  emit('close')
}

function needsResetConfirm() {
  return props.gameStarted && draftSize.value !== props.boardSize
}

function onSaveClick() {
  if (needsResetConfirm()) {
    showResetConfirm.value = true
    return
  }
  confirmSave()
}

function confirmSave() {
  emit('save', {
    boardSize: draftSize.value,
    colorTheme: normalizeUiThemeId(draftTheme.value),
    locale: normalizeLocale(draftLocale.value),
    soundEnabled: draftSoundEnabled.value,
    resetGame: needsResetConfirm(),
  })
  showResetConfirm.value = false
}
</script>

<style scoped>
.settings-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.settings-backdrop {
  position: absolute;
  inset: 0;
  background-color: var(--color-overlay);
}

.settings-dialog {
  position: relative;
  z-index: 1;
  width: min(100%, 360px);
  max-height: calc(100dvh - 2rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-radius: 12px;
  background-color: var(--color-bg);
  color: var(--color-text);
  box-shadow: 0 8px 32px var(--color-shadow);
  animation: dialog-appear var(--motion-modal) var(--motion-ease);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.settings-title {
  margin: 0;
  font-size: calc(var(--button-font-size) * 1.1);
  font-weight: bold;
}

.settings-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
}

.settings-close:hover {
  background-color: var(--color-panel);
}

.icon-close {
  width: 1.25rem;
  height: 1.25rem;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.settings-label {
  margin: 0;
  font-size: calc(var(--button-font-size) * 0.85);
  font-weight: bold;
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.option-group input[type='radio'] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.option-group input[type='radio'] + label {
  cursor: pointer;
  border: 3px solid var(--color-control-border);
  border-radius: 8px;
  padding: 0.4em 0.75em;
  font-weight: bold;
  font-size: calc(var(--button-font-size) * 0.75);
  color: var(--color-text);
  background-color: var(--color-panel);
  transition: background-color var(--motion-fast) var(--motion-ease),
  color var(--motion-fast) var(--motion-ease),
  border-color var(--motion-fast) var(--motion-ease);
}

.option-group input[type='radio']:checked + label {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-on-dark);
}

.option-group-themes {
  flex-direction: column;
  align-items: stretch;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  text-align: left;
}

.theme-indicator {
  display: inline-flex;
  gap: 3px;
  flex-shrink: 0;
}

.theme-swatch {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1px solid var(--color-control-border);
}

.theme-label {
  flex: 1;
}

.settings-save {
  align-self: stretch;
  min-height: calc(var(--toolbar-height) * 0.65);
  padding-block: 1rem;
  background-color: var(--color-board);
  border: none;
  border-radius: 8px;
  color: var(--color-on-dark);
  font-weight: bold;
  font-size: var(--button-font-size);
  cursor: pointer;
}

.confirm-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  border-radius: 12px;
  background-color: var(--color-overlay);
}

.confirm-dialog {
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--color-bg);
  color: var(--color-text);
  box-shadow: 0 4px 16px var(--color-shadow);
}

.confirm-message {
  margin: 0 0 1rem;
  font-size: calc(var(--button-font-size) * 0.8);
  line-height: 1.4;
  text-align: center;
}

.confirm-actions {
  display: flex;
  gap: 0.5rem;
}

.confirm-button {
  flex: 1;
  min-height: 2.5rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: calc(var(--button-font-size) * 0.75);
  cursor: pointer;
}

.confirm-cancel {
  background-color: var(--color-panel);
  color: var(--color-text);
}

.confirm-ok {
  background-color: var(--color-accent);
  color: var(--color-on-dark);
}
</style>
