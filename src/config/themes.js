/** @typedef {'classic' | 'classic-dark' | 'ocean' | 'ocean-dark' | 'forest' | 'forest-dark' | 'sunset' | 'sunset-dark'} UiThemeId */

export const DEFAULT_UI_THEME = 'classic'

/** @type {readonly UiThemeId[]} */
export const UI_THEME_IDS = [
    'classic',
    'classic-dark',
    'ocean',
    'ocean-dark',
    'forest',
    'forest-dark',
    'sunset',
    'sunset-dark',
]

/** @type {{ id: UiThemeId, labelKey: string, indicator: [string, string, string] }[]} */
export const UI_THEMES = [
    {id: 'classic', labelKey: 'themeClassic', indicator: ['#bbada0', '#eee4da', '#edc22e']},
    {id: 'classic-dark', labelKey: 'themeClassicDark', indicator: ['#3c3a32', '#4a463f', '#edc22e']},
    {id: 'ocean', labelKey: 'themeOcean', indicator: ['#1565a8', '#bae6fd', '#fbbf24']},
    {id: 'ocean-dark', labelKey: 'themeOceanDark', indicator: ['#1a3d5c', '#234e70', '#f59e0b']},
    {id: 'forest', labelKey: 'themeForest', indicator: ['#2d5a3d', '#d1fae5', '#eab308']},
    {id: 'forest-dark', labelKey: 'themeForestDark', indicator: ['#243d2e', '#2f4f3a', '#ca8a04']},
    {id: 'sunset', labelKey: 'themeSunset', indicator: ['#9c4a6a', '#fecdd3', '#eab308']},
    {id: 'sunset-dark', labelKey: 'themeSunsetDark', indicator: ['#4a2c35', '#5c3845', '#eab308']},
]

/**
 * @param {string} themeId
 * @returns {UiThemeId}
 */
export function normalizeUiThemeId(themeId) {
    return UI_THEME_IDS.includes(themeId) ? themeId : DEFAULT_UI_THEME
}

/**
 * @param {UiThemeId | string} themeId
 */
export function applyUiTheme(themeId) {
    document.documentElement.dataset.theme = normalizeUiThemeId(themeId)
}
