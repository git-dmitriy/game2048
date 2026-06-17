import {createGame2048} from '../lib/game2048'
import type {Game2048Engine, Game2048Options, GamePreset} from '../types/game'
import {defaultTileTheme} from './tileThemes/default'
import {defaultLayoutRatios} from '../composables/useBoardLayout'

export const defaultPreset: GamePreset = {
    id: 'default',
    theme: 'classic',
    tileTheme: defaultTileTheme,
    components: {},

    board: {
        defaultSize: 4,
        defaultWidthPx: 420,
        minWidthPx: 280,
        maxWidthPx: 420,
        horizontalWidthRatio: 0.96,
        layoutVerticalPaddingPx: 32,
    },

    layout: {
        ratios: {...defaultLayoutRatios},
    },

    rules: {
        winTileBySize: {
            3: 256,
            4: 2048,
            5: 4096,
            6: 8192,
        },
        spawnFourProbability: 0.2,
        spawnsPerMove: (size) => Math.max(1, size - 3),
        initialSpawns: (size) => Math.max(2, size - 2),
    },

    timing: {
        animationMs: 200,
        moveMs: 200,
        moveEasing: 'ease-out',
    },

    features: {
        awards: true,
        bestScorePerSize: true,
        startGameHint: true,
        scoreAnimation: 'gsap',
        awardAnimation: 'fly',
        sounds: 'default',
        soundVolume: 0.6,
    },

    persistence: {
        storage: 'localStorage',
        key: 'game2048-state',
    },

    input: {
        listenKeysOn: 'document',
        swipeSensitivity: 5,
    },
}

export function getWinTile(preset: GamePreset, size: number): number {
    return preset.rules.winTileBySize[size] ?? 2048
}

export function getBoardSizes(preset: GamePreset): number[] {
    return Object.keys(preset.rules.winTileBySize)
        .map(Number)
        .sort((a, b) => a - b)
}

export function buildSizeAimMap(preset: GamePreset): number[] {
    const map: number[] = []
    for (const [size, aim] of Object.entries(preset.rules.winTileBySize)) {
        map[Number(size)] = aim
    }
    return map
}

export function getSpawnsPerMove(preset: GamePreset, size: number): number {
    const rule = preset.rules.spawnsPerMove
    return typeof rule === 'function' ? rule(size) : (rule ?? 1)
}

export function getInitialSpawns(preset: GamePreset, size: number): number {
    const rule = preset.rules.initialSpawns
    return typeof rule === 'function' ? rule(size) : (rule ?? 2)
}

export function getGame2048Options(preset: GamePreset): Game2048Options {
    const {rules} = preset
    const options: Game2048Options = {
        spawnFourProbability: rules.spawnFourProbability ?? 0.2,
    }
    if (typeof rules.spawnValue === 'function') {
        options.spawnValue = rules.spawnValue
    }
    return options
}

export function createGame2048FromPreset(preset: GamePreset, size: number): Game2048Engine {
    return createGame2048(size, getGame2048Options(preset))
}

export function createPreset(overrides: Partial<GamePreset> = {}): GamePreset {
    return {
        ...defaultPreset,
        ...overrides,
        tileTheme: overrides.tileTheme ?? defaultPreset.tileTheme,
        components: {...defaultPreset.components, ...overrides.components},
        board: {...defaultPreset.board, ...overrides.board},
        layout: {
            ...defaultPreset.layout,
            ...overrides.layout,
            ratios: {
                ...defaultPreset.layout.ratios,
                ...overrides.layout?.ratios,
            },
        },
        rules: {...defaultPreset.rules, ...overrides.rules},
        timing: {...defaultPreset.timing, ...overrides.timing},
        features: {...defaultPreset.features, ...overrides.features},
        persistence: {
            ...defaultPreset.persistence,
            ...overrides.persistence,
        },
        input: {...defaultPreset.input, ...overrides.input},
    }
}
