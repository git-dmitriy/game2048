export const defaultPreset = {
    id: 'default',

    board: {
        defaultSize: 4, defaultWidthPx: 420, /** innerWidth < defaultWidthPx * ratio → уменьшаем доску */
        mobileBreakpointRatio: 1.04, mobileWidthRatio: 0.96,
    },

    rules: {
        winTileBySize: {
            3: 256, 4: 2048, 5: 4096, 6: 8192,
        }, spawnsPerMove: (size) => Math.max(1, size - 3), initialSpawns: (size) => Math.max(2, size - 2),
    },

    timing: {
        animationMs: 200, moveMs: 200, moveEasing: 'ease-out',
    },

    features: {
        awards: true, bestScorePerSize: true, collectAllBanner: true, scoreAnimation: 'gsap',
    },

    persistence: {
        storage: 'cookie',
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

export function createPreset(overrides = {}) {
    return {
        ...defaultPreset, ...overrides,
        board: {...defaultPreset.board, ...overrides.board},
        rules: {...defaultPreset.rules, ...overrides.rules},
        timing: {...defaultPreset.timing, ...overrides.timing},
        features: {...defaultPreset.features, ...overrides.features},
        persistence: {...defaultPreset.persistence, ...overrides.persistence},
        input: {...defaultPreset.input, ...overrides.input},
    }
}
