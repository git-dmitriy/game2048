import {ref, nextTick, type Ref} from 'vue'
import {gsap} from 'gsap'
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
    const {features} = preset
    const score = ref(0)
    const scoreInc = ref('')

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

        if (features.scoreAnimation !== 'gsap') {
            bestScore[size.value] = newScore
            return true
        }

        const animated = {score: bestScore[size.value]}
        gsap.to(animated, {
            duration: 0.2,
            score: newScore,
            ease: 'none',
            onUpdate: () => {
                bestScore[size.value] = Math.floor(animated.score)
            },
            onComplete: () => flushPersistState(),
        })
        return false
    }

    function onGameScore(args: ScoreUpdatePayload): void {
        if (features.scoreAnimation !== 'gsap') {
            score.value = args.score
            const bestScoreUpdated = updateBestScore(args.score)
            showScoreIncrement(args.scoreInc)
            if (bestScoreUpdated) flushPersistState()
            return
        }

        const animated = {score: score.value}
        gsap.to(animated, {
            duration: 0.2,
            score: args.score,
            ease: 'none',
            onUpdate: () => {
                score.value = Math.floor(animated.score)
            },
        })

        updateBestScore(args.score)
        showScoreIncrement(args.scoreInc)
    }

    function resetScore(): void {
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
