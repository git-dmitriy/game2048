import {reactive} from 'vue'
import {getBoardSizes, getWinTile} from '../config/defaultPreset'
import type {GameAwardState, GamePreset} from '../types/game'

export function useGameMeta(preset: GamePreset) {
    const sizes = getBoardSizes(preset)
    const awards = reactive<Record<number, GameAwardState>>({})
    const bestScore = reactive<Record<number, number>>({})

    for (const boardSize of sizes) {
        const aim = getWinTile(preset, boardSize)
        bestScore[boardSize] = 0
        awards[aim] = {aim, obtained: false}
    }

    return {sizes, awards, bestScore}
}
