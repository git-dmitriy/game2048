import {computed, ref, type ComponentPublicInstance, type Ref} from 'vue'
import type {GameAwardState, GamePreset} from '../types/game'
import type {GameAimHeaderExpose} from '../types/components'

interface UseAwardsDeps {
    preset: GamePreset
    awards: Record<number, GameAwardState>
    gameAim: Ref<number>
    gameAimHeaderRef: Ref<ComponentPublicInstance<GameAimHeaderExpose> | null>
    playAwardAnimation: (targets: {
        awardEl: HTMLElement | null | undefined
        sourceEl: HTMLElement | null | undefined
    }) => void
}

export function useAwards({
                              preset,
                              awards,
                              gameAim,
                              gameAimHeaderRef,
                              playAwardAnimation,
                          }: UseAwardsDeps) {
    const {features} = preset
    const awardRefs = ref<Record<number, ComponentPublicInstance | null>>({})

    const awardsList = computed(() => Object.values(awards))

    function setAwardRef(el: ComponentPublicInstance | null, aim: number): void {
        if (el) {
            awardRefs.value[aim] = el
        }
    }

    function bindAwardRef(aim: number) {
        return (el: ComponentPublicInstance | null) => setAwardRef(el, aim)
    }

    function getGameAimElement(): HTMLElement | null {
        const exposed = gameAimHeaderRef.value?.gameAimEl
        if (!exposed) return null
        if (exposed instanceof HTMLElement) return exposed
        return exposed.value ?? null
    }

    function handleAimReached(): void {
        if (features.awards && awards[gameAim.value]) {
            awards[gameAim.value].obtained = true
        }

        if (!features.awards) return

        playAwardAnimation({
            awardEl: awardRefs.value[gameAim.value]?.$el as HTMLElement | undefined,
            sourceEl: getGameAimElement(),
        })
    }

    return {
        awardsList,
        bindAwardRef,
        handleAimReached,
    }
}
