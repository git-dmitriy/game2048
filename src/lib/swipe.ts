import type {MoveDirection} from '../types/game'

interface SwipeOptions {
    sensitivity?: number
}

interface SwipeListener {
    attach: (el: HTMLElement) => void
    detach: (el: HTMLElement) => void
}

export function createSwipeListener(
    onSwipe: (direction: MoveDirection) => void | Promise<void>,
    options: SwipeOptions = {},
): SwipeListener {
    const sensitivity = options.sensitivity ?? 5
    let st: { x: number; y: number } | null = null

    function onStart(e: TouchEvent) {
        const t = e.touches[0]
        st = {x: t.clientX, y: t.clientY}
    }

    function onMove(e: TouchEvent) {
        if (!st) return
        e.preventDefault()
    }

    function onCancel() {
        st = null
    }

    async function onEnd(e: TouchEvent) {
        if (!st) return
        const t = e.changedTouches[0]
        const dx = t.clientX - st.x
        const dy = t.clientY - st.y
        st = null
        if (Math.abs(dx) < sensitivity && Math.abs(dy) < sensitivity) return
        const direction: MoveDirection = Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? 'right' : 'left')
            : (dy > 0 ? 'down' : 'up')
        await onSwipe(direction)
    }

    return {
        attach(el: HTMLElement) {
            el.addEventListener('touchstart', onStart, {passive: true})
            el.addEventListener('touchmove', onMove, {passive: false})
            el.addEventListener('touchend', onEnd, {passive: true})
            el.addEventListener('touchcancel', onCancel, {passive: true})
        },
        detach(el: HTMLElement) {
            el.removeEventListener('touchstart', onStart)
            el.removeEventListener('touchmove', onMove)
            el.removeEventListener('touchend', onEnd)
            el.removeEventListener('touchcancel', onCancel)
        },
    }
}
