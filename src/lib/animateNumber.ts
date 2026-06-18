export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function animateNumber(
    from: number,
    to: number,
    durationMs: number,
    onUpdate: (value: number) => void,
    onComplete?: () => void,
): () => void {
    if (durationMs <= 0 || from === to) {
        onUpdate(to)
        onComplete?.()
        return () => {
        }
    }

    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs)
        const value = from + (to - from) * t
        onUpdate(t < 1 ? Math.floor(value) : to)

        if (t < 1) {
            frame = requestAnimationFrame(tick)
        } else {
            onComplete?.()
        }
    }

    frame = requestAnimationFrame(tick)

    return () => {
        if (frame) {
            cancelAnimationFrame(frame)
            frame = 0
        }
    }
}
