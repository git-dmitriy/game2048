import {ref, watch, onMounted, onUnmounted, nextTick, type Ref} from 'vue'

const IDLE_MS = 3500
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const

export function useStartGameHint(
    enabled: boolean,
    gameStarted: Ref<boolean>,
    paused: Ref<boolean>,
) {
    const highlightStart = ref(false)
    let idleTimer: ReturnType<typeof setTimeout> | null = null

    function clearTimer(): void {
        if (idleTimer) {
            clearTimeout(idleTimer)
            idleTimer = null
        }
    }

    function dismiss(): void {
        highlightStart.value = false
    }

    function canSchedule(): boolean {
        return enabled && !gameStarted.value && !paused.value
    }

    async function activateHint(): Promise<void> {
        dismiss()
        await nextTick()
        highlightStart.value = true
    }

    function schedule(): void {
        clearTimer()
        dismiss()
        if (!canSchedule()) return

        idleTimer = setTimeout(() => {
            if (canSchedule()) {
                void activateHint()
            }
        }, IDLE_MS)
    }

    function onActivity(): void {
        schedule()
    }

    function onStart(): void {
        dismiss()
        clearTimer()
    }

    onMounted(() => {
        for (const eventName of ACTIVITY_EVENTS) {
            window.addEventListener(eventName, onActivity, {passive: true})
        }
        schedule()
    })

    onUnmounted(() => {
        clearTimer()
        for (const eventName of ACTIVITY_EVENTS) {
            window.removeEventListener(eventName, onActivity)
        }
    })

    watch([gameStarted, paused], () => {
        if (gameStarted.value) {
            onStart()
            return
        }
        schedule()
    })

    return {highlightStart, onStart, schedule}
}
