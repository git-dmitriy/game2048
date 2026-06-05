import {normalizeUiThemeId} from '../config/themes.js'

/**
 * Загрузка / сохранение bestScore, awards и настроек по preset.persistence.
 * @param {object} preset
 * @param {{ awards: object, bestScore: object, settings?: { size?: number, theme?: string } }} stores
 */
export function useGamePersistence(preset, stores) {
    const {storage = 'cookie', key = 'game2048-state'} = preset.persistence ?? {}

    function readRaw() {
        if (storage === 'none') return null
        if (storage === 'localStorage') {
            return localStorage.getItem(key)
        }
        if (storage === 'cookie') {
            for (const part of document.cookie.split('; ')) {
                const eq = part.indexOf('=')
                if (eq === -1) continue
                if (decodeURIComponent(part.slice(0, eq)) === key) {
                    return decodeURIComponent(part.slice(eq + 1))
                }
            }
            const c = document.cookie.trim()
            if (c.startsWith('{')) return c
            return null
        }
        return null
    }

    function writeRaw(json) {
        if (storage === 'none') return
        if (storage === 'localStorage') {
            localStorage.setItem(key, json)
            return
        }
        if (storage === 'cookie') {
            const maxAge = 60 * 60 * 24 * 365
            document.cookie =
                key + '=' + encodeURIComponent(json) + ';path=/;max-age=' + maxAge + ';SameSite=Lax'
        }
    }

    function loadState() {
        try {
            const raw = readRaw()
            if (!raw) return
            const state = JSON.parse(raw)
            if (!state) return
            if (state.awards) Object.assign(stores.awards, state.awards)
            if (state.bestScore) Object.assign(stores.bestScore, state.bestScore)
            if (state.settings && stores.settings) {
                if (typeof state.settings.size === 'number') {
                    stores.settings.size = state.settings.size
                }
                if (typeof state.settings.theme === 'string') {
                    stores.settings.theme = normalizeUiThemeId(state.settings.theme)
                }
            }
        } catch (e) {
        }
    }

    function persistState() {
        try {
            const state = {
                bestScore: {...stores.bestScore},
                awards: {...stores.awards},
            }
            if (stores.settings) {
                state.settings = {
                    size: stores.settings.size,
                    theme: stores.settings.theme,
                }
            }
            writeRaw(JSON.stringify(state))
        } catch (e) {
        }
    }

    return {loadState, persistState}
}
