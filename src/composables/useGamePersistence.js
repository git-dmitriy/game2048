import {isRef, unref, onMounted, onBeforeUnmount} from 'vue'
import {normalizeUiThemeId} from '../config/themes.js'
import {normalizeLocale} from '../i18n/index.js'

const DEFAULT_STORAGE_KEY = 'game2048-state'
const PERSIST_DEBOUNCE_MS = 400

/**
 * @typedef {import('../lib/gameSession.js').GameSession} GameSession
 */

/**
 * @typedef {object} GamePersistedState
 * @property {Record<string, number>} [bestScore]
 * @property {Record<string, { aim: number, obtained: boolean }>} [awards]
 * @property {{ size?: number, theme?: string, locale?: string }} [settings]
 * @property {GameSession | null} [session]
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
 * @param {{
 *   awards: object,
 *   bestScore: object,
 *   settings?: { size?: number, theme?: string, locale?: string },
 *   session?: GameSession | null,
 * }} stores
 */
export function useGamePersistence(preset, stores) {
    /** @type {ReturnType<typeof setTimeout> | null} */
    let persistTimer = null
    let dirty = false

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
                locale: stores.settings.locale,
            }
        }

        if (stores.session !== undefined) {
            state.session = unref(stores.session) ?? null
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
            if (typeof state.settings.locale === 'string') {
                stores.settings.locale = normalizeLocale(state.settings.locale)
            }
        }

        if (stores.session !== undefined) {
            const sessionValue = state.session ?? null
            if (isRef(stores.session)) {
                stores.session.value = sessionValue
            } else {
                stores.session = sessionValue
            }
        }
    }

    function flushPersistState() {
        if (persistTimer) {
            clearTimeout(persistTimer)
            persistTimer = null
        }

        if (!isPersistenceEnabled(preset)) {
            dirty = false
            return
        }

        saveGameState(preset, buildState())
        dirty = false
    }

    function persistState() {
        if (!isPersistenceEnabled(preset)) return

        dirty = true
        if (persistTimer) clearTimeout(persistTimer)
        persistTimer = setTimeout(flushPersistState, PERSIST_DEBOUNCE_MS)
    }

    function flushOnExit() {
        if (!dirty) return
        flushPersistState()
    }

    function clearSession() {
        if (stores.session === undefined) return
        if (isRef(stores.session)) {
            stores.session.value = null
        } else {
            stores.session = null
        }
        dirty = true
        flushPersistState()
    }

    onMounted(() => {
        window.addEventListener('pagehide', flushOnExit)
        document.addEventListener('visibilitychange', onVisibilityChange)
    })

    onBeforeUnmount(() => {
        flushOnExit()
        window.removeEventListener('pagehide', flushOnExit)
        document.removeEventListener('visibilitychange', onVisibilityChange)
        if (persistTimer) {
            clearTimeout(persistTimer)
            persistTimer = null
        }
    })

    function onVisibilityChange() {
        if (document.visibilityState === 'hidden') {
            flushOnExit()
        }
    }

    return {loadState, persistState, flushPersistState, clearSession}
}
