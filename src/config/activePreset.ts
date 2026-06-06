import {createPreset} from './defaultPreset'
import type {GamePreset} from '../types/game'

export const activePreset: GamePreset = createPreset({
    // Пример классического 2048:
    // rules: { spawnsPerMove: 1, initialSpawns: 2 },
    // features: { awardAnimation: 'none' },
    // timing: { animationMs: 150, moveMs: 150 },
    // persistence: { storage: 'none' },
})
