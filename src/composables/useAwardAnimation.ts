import type {AwardAnimation, GamePreset} from '../types/game'

interface AwardAnimationTargets {
    awardEl: HTMLElement | null | undefined
    sourceEl: HTMLElement | null | undefined
}

export function runAwardAnimation(
    policy: AwardAnimation | string,
    {awardEl, sourceEl}: AwardAnimationTargets,
): void {
    if (policy === 'none' || !awardEl || !sourceEl) {
        return
    }

    if (policy === 'pulse') {
        return
    }

    if (policy === 'fly') {
        const p1 = sourceEl.getBoundingClientRect()
        const p2 = awardEl.getBoundingClientRect()
        const ws = p1.width / p2.width
        const hs = p1.height / p2.height
        const x = p1.left - p2.left + p1.width / 4
        const y = p1.top - p2.top + p1.height / 2

        awardEl.style.transform =
            'translate(' + x + 'px,' + y + 'px) scale(' + ws + ',' + hs + ')'
        awardEl.style.transition = ''
        awardEl.style.zIndex = '100'
        requestAnimationFrame(() => {
            awardEl.style.transition = 'all var(--motion-award) var(--motion-ease)'
            awardEl.style.transform = ''
        })
    }
}

export function useAwardAnimation(preset: GamePreset) {
    const policy = preset.features?.awardAnimation ?? 'fly'

    function play(targets: AwardAnimationTargets): void {
        runAwardAnimation(policy, targets)
    }

    return {policy, play}
}
