import {ref, type Ref} from 'vue'
import {getWinTile} from '../config/defaultPreset'
import {applyUiTheme} from '../config/themes'
import {detectLocale, setAppLocale} from '../i18n'
import type {GamePreset, UiThemeId} from '../types/game'
import type {SettingsSavePayload} from '../types/settings'

export interface AppSettingsState {
    size: number
    theme: UiThemeId
    locale: ReturnType<typeof detectLocale>
    soundEnabled: boolean
}

interface UseAppSettingsDeps {
    preset: GamePreset
    appSettings: AppSettingsState
    size: Ref<number>
    gameAim: Ref<number>
    gameStarted: Ref<boolean>
    gameEnded: Ref<boolean>
    gameAimReached: Ref<boolean>
    resetScore: () => void
    clearSession: () => void
    flushPersistState: () => void
}

export function useAppSettings({
                                   preset,
                                   appSettings,
                                   size,
                                   gameAim,
                                   gameStarted,
                                   gameEnded,
                                   gameAimReached,
                                   resetScore,
                                   clearSession,
                                   flushPersistState,
                               }: UseAppSettingsDeps) {
    const showSettings = ref(false)

    function openSettings(): void {
        showSettings.value = true
    }

    function closeSettings(): void {
        showSettings.value = false
    }

    function onSettingsSave({boardSize, colorTheme, locale, soundEnabled, resetGame}: SettingsSavePayload): void {
        if (resetGame) {
            gameStarted.value = false
            gameEnded.value = false
            gameAimReached.value = false
            resetScore()
            clearSession()
        }

        size.value = boardSize
        appSettings.size = boardSize
        appSettings.theme = colorTheme
        appSettings.locale = setAppLocale(locale)
        appSettings.soundEnabled = soundEnabled
        applyUiTheme(colorTheme)
        gameAim.value = getWinTile(preset, boardSize)
        showSettings.value = false
        flushPersistState()
    }

    return {
        showSettings,
        openSettings,
        closeSettings,
        onSettingsSave,
    }
}
