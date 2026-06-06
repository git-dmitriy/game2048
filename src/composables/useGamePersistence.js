import {normalizeUiThemeId} from '../config/themes.js'

const DEFAULT_STORAGE_KEY = 'game2048-state'

/**
 * @typedef {object} GamePersistedState
 * @property {Record<string, number>} [bestScore]
 * @property {Record<string, { aim: number, obtained: boolean }>} [awards]
 * @property {{ size?: number, theme?: string }} [settings]
 */

/**
 * @param {object} preset
 * @returns {string}
 */
function getStorageKey(preset) {
    return preset.persistence?.key ?? DEFAULT_STORAGE_KEY
}

/**
 * @param {object} preset
 * @returns {boolean}
 */
function isPersistenceEnabled(preset) {
    return preset.persistence?.storage !== 'none'
}

/**
 * @param {object} preset
 * @returns {GamePersistedState | null}
 */
export function loadGameState(preset) {
    if (!isPersistenceEnabled(preset)) return null

    try {
        const raw = localStorage.getItem(getStorageKey(preset))
        if (!raw) return null
        const state = JSON.parse(raw)
        return state && typeof state === 'object' ? state : null
    } catch {
        return null
    }
}

/**
 * @param {object} preset
 * @param {GamePersistedState} state
 */
export function saveGameState(preset, state) {
    if (!isPersistenceEnabled(preset)) return

    try {
        localStorage.setItem(getStorageKey(preset), JSON.stringify(state))
    } catch {
    }
}

/**
 * Загрузка / сохранение bestScore, awards и настроек в localStorage.
 * @param {object} preset
 * @param {{ awards: object, bestScore: object, settings?: { size?: number, theme?: string } }} stores
 */
export function useGamePersistence(preset, stores) {
    function buildState() {
        /** @type {GamePersistedState} */
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

        return state
    }

    function loadState() {
        const state = loadGameState(preset)
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
    }

    function persistState() {
        saveGameState(preset, buildState())
    }

    return {loadState, persistState}
}
