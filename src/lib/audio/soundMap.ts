export const SOUND_URLS = {
    move: '/sounds/move.wav',
    merge: '/sounds/merge.wav',
    spawn: '/sounds/spawn.wav',
    win: '/sounds/win.wav',
    gameOver: '/sounds/game-over.wav',
} as const

export type SoundId = keyof typeof SOUND_URLS

const MERGE_PITCH_STEP = 0.08
const MERGE_PITCH_MIN = 0.85
const MERGE_PITCH_MAX = 2

export function mergePlaybackRate(value: number): number {
    if (value <= 0) return 1
    const power = Math.log2(value)
    const rate = MERGE_PITCH_MIN + MERGE_PITCH_STEP * (power - 1)
    return Math.min(MERGE_PITCH_MAX, Math.max(MERGE_PITCH_MIN, rate))
}
