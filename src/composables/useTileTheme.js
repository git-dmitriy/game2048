import {inject} from 'vue'
import {tileThemeKey} from '../config/injectionKeys.js'
import {defaultTileTheme} from '../config/tileThemes/default.js'

export function useTileTheme() {
    const theme = inject(tileThemeKey)
    if (!theme) {
        if (import.meta.env.DEV) {
            console.warn('[useTileTheme] tile theme not provided, using defaultTileTheme')
        }
        return defaultTileTheme
    }
    return theme
}
