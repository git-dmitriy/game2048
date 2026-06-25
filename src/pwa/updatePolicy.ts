/**
 * After this much time in the background, apply a pending update (or reload) on return.
 * 60 minutes: short breaks won't interrupt play; returning later still gets fresh builds.
 */
export const BACKGROUND_FORCE_RELOAD_MS = 60 * 60 * 1000

let appReady = false
let pendingUpdateHandler: (() => void) | null = null
let sessionActive = false
let settingsOpen = false
let beforeReload: (() => void) | null = null
let lastHiddenAt = 0

export function setPwaBeforeReload(callback: () => void): void {
    beforeReload = callback
}

export function invokePwaBeforeReload(): void {
    beforeReload?.()
}

export function setPwaSessionActive(active: boolean): void {
    sessionActive = active
}

export function setPwaSettingsOpen(open: boolean): void {
    settingsOpen = open
}

export function canSilentPwaUpdate(): boolean {
    return !sessionActive && !settingsOpen
}

export function markPwaHidden(): void {
    lastHiddenAt = Date.now()
}

export function shouldForcePwaReloadAfterBackground(): boolean {
    if (lastHiddenAt <= 0) return false
    return Date.now() - lastHiddenAt >= BACKGROUND_FORCE_RELOAD_MS
}

export function notifyPwaAppReady(): void {
    appReady = true
    if (pendingUpdateHandler) {
        const handler = pendingUpdateHandler
        pendingUpdateHandler = null
        handler()
    }
}

export function queuePwaUpdateUntilReady(onUpdate: () => void): void {
    if (appReady) {
        onUpdate()
        return
    }
    pendingUpdateHandler = onUpdate
}
