import {createGame2048} from '../lib/game2048.js'
import {defaultTileTheme} from './tileThemes/default.js'
import {defaultLayoutRatios} from '../composables/useBoardLayout.js'
import {defaultStrings} from './strings/default.js'

export const defaultPreset = {
    id: 'default',
    theme: 'default',
    tileTheme: defaultTileTheme,
    strings: defaultStrings,
    components: {},

    board: {
        defaultSize: 4,
        defaultWidthPx: 420,
        minWidthPx: 280,
        maxWidthPx: 420,
        /** Доля viewport по ширине (clamp в CSS: min(ratio * 100vw, maxWidthPx)) */
        horizontalWidthRatio: 0.96,
        /** Отступ сверху/снизу при расчёте лимита по высоте (px) */
        layoutVerticalPaddingPx: 32,
        /** @deprecated оставлено для обратной совместимости пресетов */
        mobileBreakpointRatio: 1.04,
        mobileWidthRatio: 0.96,
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
        animationMs: 200, moveMs: 200, moveEasing: 'ease-out',
    },

    features: {
        awards: true,
        bestScorePerSize: true,
        collectAllBanner: true,
        scoreAnimation: 'gsap',
        awardAnimation: 'fly',
    },

    persistence: {
        /** 'cookie' | 'localStorage' | 'none' */
        storage: 'cookie',
        key: 'game2048-state',
    },

    input: {
        listenKeysOn: 'document', swipeSensitivity: 5,
    },
}

export function getWinTile(preset, size) {
    return preset.rules.winTileBySize[size] ?? 2048
}


export function getBoardSizes(preset) {
    return Object.keys(preset.rules.winTileBySize)
        .map(Number)
        .sort((a, b) => a - b)
}

export function buildSizeAimMap(preset) {
    const map = []
    for (const [size, aim] of Object.entries(preset.rules.winTileBySize)) {
        map[Number(size)] = aim
    }
    return map
}

export function getSpawnsPerMove(preset, size) {
    const rule = preset.rules.spawnsPerMove
    return typeof rule === 'function' ? rule(size) : (rule ?? 1)
}

export function getInitialSpawns(preset, size) {
    const rule = preset.rules.initialSpawns
    return typeof rule === 'function' ? rule(size) : (rule ?? 2)
}

export function getGame2048Options(preset) {
    const {rules} = preset
    const options = {
        spawnFourProbability: rules.spawnFourProbability ?? 0.2,
    }
    if (typeof rules.spawnValue === 'function') {
        options.spawnValue = rules.spawnValue
    }
    return options
}

export function createGame2048FromPreset(preset, size) {
    return createGame2048(size, getGame2048Options(preset))
}

export function createPreset(overrides = {}) {
    return {
        ...defaultPreset, ...overrides,
        tileTheme: overrides.tileTheme ?? defaultPreset.tileTheme,
        strings: {...defaultPreset.strings, ...overrides.strings},
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
