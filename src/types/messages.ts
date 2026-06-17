export interface MessageSchema {
    [key: string]: string

    sizeLabel: string
    newGame: string
    end: string
    settings: string
    boardSize: string
    colorScheme: string
    language: string
    sound: string
    soundOn: string
    soundOff: string
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
    pwaInstallTitle: string
    pwaInstallStep1: string
    pwaInstallStep2: string
    pwaInstallStep3: string
    pwaInstallGotIt: string
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
