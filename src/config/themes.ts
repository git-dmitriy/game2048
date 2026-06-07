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

export type AppleStatusBarStyle = 'default' | 'black' | 'black-translucent'

export interface UiThemePwaMeta {
    themeColor: string
    backgroundColor: string
    appleStatusBarStyle: AppleStatusBarStyle
}

export const UI_THEME_PWA_META: Record<UiThemeId, UiThemePwaMeta> = {
    classic: {
        themeColor: '#bbada0',
        backgroundColor: '#faf8ef',
        appleStatusBarStyle: 'default',
    },
    'classic-dark': {
        themeColor: '#3c3a32',
        backgroundColor: '#1a1a1a',
        appleStatusBarStyle: 'black-translucent',
    },
    ocean: {
        themeColor: '#1565a8',
        backgroundColor: '#e8f4fc',
        appleStatusBarStyle: 'default',
    },
    'ocean-dark': {
        themeColor: '#1a3d5c',
        backgroundColor: '#0c1929',
        appleStatusBarStyle: 'black-translucent',
    },
    forest: {
        themeColor: '#2d5a3d',
        backgroundColor: '#f0f7f0',
        appleStatusBarStyle: 'default',
    },
    'forest-dark': {
        themeColor: '#243d2e',
        backgroundColor: '#141f17',
        appleStatusBarStyle: 'black-translucent',
    },
    sunset: {
        themeColor: '#9c4a6a',
        backgroundColor: '#fff5f0',
        appleStatusBarStyle: 'default',
    },
    'sunset-dark': {
        themeColor: '#4a2c35',
        backgroundColor: '#1f1418',
        appleStatusBarStyle: 'black-translucent',
    },
}

const THEME_COLOR_META = 'theme-color'
const APPLE_STATUS_BAR_META = 'apple-mobile-web-app-status-bar-style'

function setNamedMetaContent(name: string, content: string): void {
    let meta = document.querySelector(`meta[name="${name}"]`)
    if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
}

export function applyPwaThemeMeta(themeId: UiThemeId | string): void {
    const meta = UI_THEME_PWA_META[normalizeUiThemeId(themeId)]
    setNamedMetaContent(THEME_COLOR_META, meta.themeColor)
    setNamedMetaContent(APPLE_STATUS_BAR_META, meta.appleStatusBarStyle)
}

export function normalizeUiThemeId(themeId: string): UiThemeId {
    const id = themeId as UiThemeId
    return UI_THEME_IDS.includes(id) ? id : DEFAULT_UI_THEME
}

export function applyUiTheme(themeId: UiThemeId | string): void {
    const normalized = normalizeUiThemeId(themeId)
    document.documentElement.dataset.theme = normalized
    applyPwaThemeMeta(normalized)
}
