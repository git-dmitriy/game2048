import {inject} from 'vue'
import {gamePresetKey} from '../config/injectionKeys'
import {defaultPreset} from '../config/defaultPreset'
import type {GamePreset} from '../types/game'

export function useGamePreset(): GamePreset {
    const preset = inject(gamePresetKey)
    if (!preset) {
        if (import.meta.env.DEV) {
            console.warn('[useGamePreset] preset not provided, using defaultPreset')
        }
        return defaultPreset
    }
    return preset
}
