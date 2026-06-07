import {inject} from 'vue'
import {tileThemeKey} from '../config/injectionKeys'
import {defaultTileTheme} from '../config/tileThemes/default'
import type {TileTheme} from '../types/game'

export function useTileTheme(): TileTheme {
    const theme = inject(tileThemeKey)
    if (!theme) {
        if (import.meta.env.DEV) {
            console.warn('[useTileTheme] tileTheme not provided, using defaultTileTheme')
        }
        return defaultTileTheme
    }
    return theme
}
