export interface MessageSchema {
    [key: string]: string

    sizeLabel: string
    newGame: string
    end: string
    settings: string
    boardSize: string
    colorScheme: string
    language: string
    save: string
    confirm: string
    cancel: string
    settingsResetWarning: string
    themeClassic: string
    themeClassicDark: string
    themeOcean: string
    themeOceanDark: string
    themeForest: string
    themeForestDark: string
    themeSunset: string
    themeSunsetDark: string
    gameOver: string
    score: string
    best: string
    website: string
    githubProfile: string
    pwaUpdateAvailable: string
    pwaUpdate: string
    pwaLater: string
}

export type ThemeLabelKey =
    | 'themeClassic'
    | 'themeClassicDark'
    | 'themeOcean'
    | 'themeOceanDark'
    | 'themeForest'
    | 'themeForestDark'
    | 'themeSunset'
    | 'themeSunsetDark'
