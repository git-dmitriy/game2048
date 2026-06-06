import type {UiThemeId} from '../types/game'
import type {ThemeLabelKey} from '../types/messages'

export const DEFAULT_UI_THEME: UiThemeId = 'classic'

export const UI_THEME_IDS: readonly UiThemeId[] = [
    'classic',
    'classic-dark',
    'ocean',
    'ocean-dark',
    'forest',
    'forest-dark',
    'sunset',
    'sunset-dark',
]

export const UI_THEMES: Array<{
    id: UiThemeId
    labelKey: ThemeLabelKey
    indicator: [string, string, string]
}> = [
    {id: 'classic', labelKey: 'themeClassic', indicator: ['#bbada0', '#eee4da', '#edc22e']},
    {id: 'classic-dark', labelKey: 'themeClassicDark', indicator: ['#3c3a32', '#4a463f', '#edc22e']},
    {id: 'ocean', labelKey: 'themeOcean', indicator: ['#1565a8', '#bae6fd', '#fbbf24']},
    {id: 'ocean-dark', labelKey: 'themeOceanDark', indicator: ['#1a3d5c', '#234e70', '#f59e0b']},
    {id: 'forest', labelKey: 'themeForest', indicator: ['#2d5a3d', '#d1fae5', '#eab308']},
    {id: 'forest-dark', labelKey: 'themeForestDark', indicator: ['#243d2e', '#2f4f3a', '#ca8a04']},
    {id: 'sunset', labelKey: 'themeSunset', indicator: ['#9c4a6a', '#fecdd3', '#eab308']},
    {id: 'sunset-dark', labelKey: 'themeSunsetDark', indicator: ['#4a2c35', '#5c3845', '#eab308']},
]

export function normalizeUiThemeId(themeId: string): UiThemeId {
    const id = themeId as UiThemeId
    return UI_THEME_IDS.includes(id) ? id : DEFAULT_UI_THEME
}

export function applyUiTheme(themeId: UiThemeId | string): void {
    document.documentElement.dataset.theme = normalizeUiThemeId(themeId)
}
