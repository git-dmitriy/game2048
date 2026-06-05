/** @typedef {'default' | 'classic' | 'classic-dark'} UiThemeId */

/** @type {readonly UiThemeId[]} */
export const UI_THEME_IDS = ['default', 'classic', 'classic-dark']

/** @type {{ id: UiThemeId, labelKey: string, indicator: [string, string, string] }[]} */
export const UI_THEMES = [
    {id: 'default', labelKey: 'themeDefault', indicator: ['#35495e', '#41b883', '#87e293']},
    {id: 'classic', labelKey: 'themeClassic', indicator: ['#bbada0', '#eee4da', '#edc22e']},
    {id: 'classic-dark', labelKey: 'themeClassicDark', indicator: ['#3c3a32', '#4a463f', '#edc22e']},
]

/**
 * @param {string} themeId
 * @returns {UiThemeId}
 */
export function normalizeUiThemeId(themeId) {
    return UI_THEME_IDS.includes(themeId) ? themeId : 'default'
}

/**
 * @param {UiThemeId | string} themeId
 */
export function applyUiTheme(themeId) {
    document.documentElement.dataset.theme = normalizeUiThemeId(themeId)
}
