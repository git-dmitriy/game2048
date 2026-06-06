import {ref, watch, onMounted, onUnmounted, nextTick} from 'vue'

const IDLE_MS = 3500
const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart']

/**
 * Подсказка «начать игру»: пульсация кнопки New Game после бездействия.
 * @param {boolean} enabled
 * @param {import('vue').Ref<boolean>} gameStarted
 * @param {import('vue').Ref<boolean>} paused — модалка настроек и т.п.
 */
export function useStartGameHint(enabled, gameStarted, paused) {
    const highlightStart = ref(false)
    let idleTimer = null

    function clearTimer() {
        if (idleTimer) {
            clearTimeout(idleTimer)
            idleTimer = null
        }
    }

    function dismiss() {
        highlightStart.value = false
    }

    function canSchedule() {
        return enabled && !gameStarted.value && !paused.value
    }

    async function activateHint() {
        dismiss()
        await nextTick()
        highlightStart.value = true
    }

    function schedule() {
        clearTimer()
        dismiss()
        if (!canSchedule()) return

        idleTimer = setTimeout(() => {
            if (canSchedule()) {
                activateHint()
            }
        }, IDLE_MS)
    }

    function onActivity() {
        schedule()
    }

    function onStart() {
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
