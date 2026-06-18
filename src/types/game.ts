import type {Component} from 'vue'

export type UiThemeId =
    | 'classic'
    | 'classic-dark'
    | 'ocean'
    | 'ocean-dark'
    | 'forest'
    | 'forest-dark'
    | 'sunset'
    | 'sunset-dark'

export type LocaleId = 'ru' | 'en' | 'de' | 'it' | 'es'

export type PersistenceStorage = 'localStorage' | 'none'

export type AwardAnimation = 'fly' | 'none'

export type SoundPolicy = 'default' | 'none'

export type ListenKeysOn = 'document' | 'board'

export type MoveDirection = 'left' | 'right' | 'up' | 'down'

export interface GameSession {
    size: number
    score: number
    board: number[][]
    gameEnded: boolean
    gameAimReached: boolean
}

export interface GameSettings {
    size?: number
    theme?: UiThemeId | string
    locale?: LocaleId | string
    soundEnabled?: boolean
}

export interface GameAwardState {
    aim: number
    obtained: boolean
}

export interface GamePersistedState {
    bestScore?: Record<string, number>
    awards?: Record<string, GameAwardState>
    settings?: GameSettings
    session?: GameSession | null
}

export interface LayoutRatios {
    awardsHeight: number
    toolbarHeight: number
    gameOverSizeDivisor: number
    gameAimFontSizeDivisor: number
    buttonFontSizeDivisor: number
    scoreFontSizeDivisor: number
    awardFontSizeDivisor: number
    awardLikeHeightDivisor: number
    awardWidthDivisor: number
}

export interface TileTheme {
    id: string
    fontSizeByPower: Record<number, number>
    getFontSizeCoef: (value: number) => number
    getChipStyle: (value: number, sizePx: number) => Record<string, string>
}

export interface AppComponentsMap {
    GameAimHeader?: Component
    GameToolbar?: Component
    GameOverlay?: Component
    GameBoard?: Component
    GameAward?: Component
}

export interface GamePreset {
    id: string
    theme: UiThemeId | string
    tileTheme: TileTheme
    components: AppComponentsMap
    board: {
        defaultSize: number
        defaultWidthPx: number
        minWidthPx: number
        maxWidthPx: number
        horizontalWidthRatio: number
        layoutVerticalPaddingPx: number
    }
    layout: {
        ratios: LayoutRatios
    }
    rules: {
        winTileBySize: Record<number, number>
        spawnFourProbability: number
        spawnsPerMove: number | ((size: number) => number)
        initialSpawns: number | ((size: number) => number)
        spawnValue?: (random: () => number) => number
    }
    timing: {
        animationMs: number
        moveMs: number
        moveEasing: string
        scoreAnimationMs: number
    }
    features: {
        awards: boolean
        bestScorePerSize: boolean
        startGameHint: boolean
        awardAnimation: AwardAnimation | string
        sounds: SoundPolicy | boolean
        soundVolume?: number
    }
    persistence: {
        storage: PersistenceStorage | string
        key: string
    }
    input: {
        listenKeysOn: ListenKeysOn | string
        swipeSensitivity: number
    }
}

export interface Game2048Options {
    spawnFourProbability?: number
    spawnValue?: (random: () => number) => number
}

export interface CellCoord {
    x: number
    y: number
}

export interface ChipCoord extends CellCoord {
    value: number
}

export interface Game2048Snapshot {
    board: number[][]
    score: number
}

export interface Game2048MoveResult {
    moves: Array<{ from: CellCoord; to: CellCoord }>
    consolidations: ChipCoord[]
    scoreInc: number
}

export interface Game2048Engine {
    size: number
    board: number[][]
    score: () => number
    getSnapshot: () => Game2048Snapshot
    loadSnapshot: (board: number[][], score: number) => boolean
    turn: () => ChipCoord[]
    spawnTiles: (count: number) => ChipCoord[]
    right: () => Game2048MoveResult
    down: () => Game2048MoveResult
    left: () => Game2048MoveResult
    up: () => Game2048MoveResult
    canMove: () => boolean
}

export interface BoardChip {
    value: number
    _chipId?: number
    _moveKey?: number
    prevRelPos?: { left: number; top: number }
}

export interface BoardCell {
    chips: BoardChip[]
}
