import {isRef, unref, onMounted, onBeforeUnmount, type Ref} from 'vue'
import {normalizeUiThemeId} from '../config/themes'
import {normalizeLocale} from '../i18n'
import type {
    GameAwardState,
    GamePersistedState,
    GamePreset,
    GameSession,
    GameSettings,
} from '../types/game'

const DEFAULT_STORAGE_KEY = 'game2048-state'
const PERSIST_DEBOUNCE_MS = 400

interface PersistenceStores {
    awards: Record<string, GameAwardState>
    bestScore: Record<string, number>
    settings?: GameSettings
    session?: GameSession | null | Ref<GameSession | null>
}

function getStorageKey(preset: GamePreset): string {
    return preset.persistence?.key ?? DEFAULT_STORAGE_KEY
}

function isPersistenceEnabled(preset: GamePreset): boolean {
    return preset.persistence?.storage !== 'none'
}

export function loadGameState(preset: GamePreset): GamePersistedState | null {
    if (!isPersistenceEnabled(preset)) return null

    try {
        const raw = localStorage.getItem(getStorageKey(preset))
        if (!raw) return null
        const state = JSON.parse(raw) as GamePersistedState
        return state && typeof state === 'object' ? state : null
    } catch {
        return null
    }
}

export function saveGameState(preset: GamePreset, state: GamePersistedState): void {
    if (!isPersistenceEnabled(preset)) return

    try {
        localStorage.setItem(getStorageKey(preset), JSON.stringify(state))
    } catch {
    }
}

export function useGamePersistence(preset: GamePreset, stores: PersistenceStores) {
    let persistTimer: ReturnType<typeof setTimeout> | null = null
    let dirty = false

    function buildState(): GamePersistedState {
        const state: GamePersistedState = {
            bestScore: {...stores.bestScore},
            awards: {...stores.awards},
        }

        if (stores.settings) {
            state.settings = {
                size: stores.settings.size,
                theme: stores.settings.theme,
                locale: stores.settings.locale,
                soundEnabled: stores.settings.soundEnabled,
            }
        }

        if (stores.session !== undefined) {
            state.session = unref(stores.session) ?? null
        }

        return state
    }

    function loadState(): void {
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
            if (typeof state.settings.soundEnabled === 'boolean') {
                stores.settings.soundEnabled = state.settings.soundEnabled
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

    function flushPersistState(): void {
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

    function persistState(): void {
        if (!isPersistenceEnabled(preset)) return

        dirty = true
        if (persistTimer) clearTimeout(persistTimer)
        persistTimer = setTimeout(flushPersistState, PERSIST_DEBOUNCE_MS)
    }

    function flushOnExit(): void {
        if (!dirty) return
        flushPersistState()
    }

    function clearSession(): void {
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

    function onVisibilityChange(): void {
        if (document.visibilityState === 'hidden') {
            flushOnExit()
        }
    }

    return {loadState, persistState, flushPersistState, clearSession}
}
