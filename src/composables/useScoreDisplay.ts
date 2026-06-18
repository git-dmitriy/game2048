import {ref, nextTick, type Ref} from 'vue'
import {animateNumber, prefersReducedMotion} from '../lib/animateNumber'
import type {GamePreset} from '../types/game'

interface ScoreUpdatePayload {
    score: number
    scoreInc: number
}

export function useScoreDisplay(
    preset: GamePreset,
    size: Ref<number>,
    bestScore: Record<number, number>,
    flushPersistState: () => void,
) {
    const {features, timing} = preset
    const scoreAnimationMs = timing.scoreAnimationMs ?? 200
    const score = ref(0)
    const scoreInc = ref('')
    let cancelScoreAnimation: (() => void) | null = null
    let cancelBestScoreAnimation: (() => void) | null = null

    function stopScoreAnimations(): void {
        cancelScoreAnimation?.()
        cancelScoreAnimation = null
        cancelBestScoreAnimation?.()
        cancelBestScoreAnimation = null
    }

    function showScoreIncrement(inc: number): void {
        scoreInc.value = inc + '+'
        nextTick(() => {
            scoreInc.value = ''
        })
    }

    function updateBestScore(newScore: number): boolean {
        if (!features.bestScorePerSize || newScore <= bestScore[size.value]) {
            return false
        }

        if (prefersReducedMotion()) {
            bestScore[size.value] = newScore
            return true
        }

        cancelBestScoreAnimation?.()
        const from = bestScore[size.value]
        cancelBestScoreAnimation = animateNumber(
            from,
            newScore,
            scoreAnimationMs,
            (value) => {
                bestScore[size.value] = value
            },
            () => {
                cancelBestScoreAnimation = null
                flushPersistState()
            },
        )
        return false
    }

    function onGameScore(args: ScoreUpdatePayload): void {
        if (prefersReducedMotion()) {
            score.value = args.score
            const bestScoreUpdated = updateBestScore(args.score)
            showScoreIncrement(args.scoreInc)
            if (bestScoreUpdated) flushPersistState()
            return
        }

        cancelScoreAnimation?.()
        cancelScoreAnimation = animateNumber(
            score.value,
            args.score,
            scoreAnimationMs,
            (value) => {
                score.value = value
            },
            () => {
                cancelScoreAnimation = null
            },
        )

        const bestScoreUpdated = updateBestScore(args.score)
        showScoreIncrement(args.scoreInc)
        if (bestScoreUpdated) flushPersistState()
    }

    function resetScore(): void {
        stopScoreAnimations()
        score.value = 0
        scoreInc.value = ''
    }

    return {
        score,
        scoreInc,
        onGameScore,
        resetScore,
    }
}
