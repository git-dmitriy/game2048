import type {LocaleId, UiThemeId} from './game'

export interface SettingsSavePayload {
    boardSize: number
    colorTheme: UiThemeId
    locale: LocaleId
    soundEnabled: boolean
    resetGame: boolean
}
