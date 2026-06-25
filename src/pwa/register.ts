import {ref} from 'vue'
import {registerSW} from 'virtual:pwa-register'
import {
    canSilentPwaUpdate,
    invokePwaBeforeReload,
    markPwaHidden,
    queuePwaUpdateUntilReady,
    shouldForcePwaReloadAfterBackground,
} from './updatePolicy'

export const pwaNeedRefresh = ref(false)
export const pwaUpdateInProgress = ref(false)

let reloadScheduled = false
let swRegistration: ServiceWorkerRegistration | null = null

function scheduleReload(): void {
    if (reloadScheduled) return
    reloadScheduled = true
    window.location.reload()
}

function hasWaitingWorker(registration: ServiceWorkerRegistration | null): boolean {
    return Boolean(registration?.waiting)
}

function handleUpdateAvailable(): void {
    if (pwaUpdateInProgress.value || reloadScheduled) return

    queuePwaUpdateUntilReady(() => {
        if (pwaUpdateInProgress.value || reloadScheduled) return

        if (canSilentPwaUpdate()) {
            void applySilentUpdate()
            return
        }

        pwaNeedRefresh.value = true
    })
}

async function applySilentUpdate(): Promise<void> {
    if (pwaUpdateInProgress.value || reloadScheduled) return

    pwaUpdateInProgress.value = true
    pwaNeedRefresh.value = false
    invokePwaBeforeReload()

    try {
        await applyPwaUpdate()
    } catch (error) {
        pwaUpdateInProgress.value = false
        console.error('Service worker silent update failed:', error)
    }
}

function watchInstallingWorker(worker: ServiceWorker): void {
    worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            handleUpdateAvailable()
        }
    })
}

function attachRegistrationListeners(registration: ServiceWorkerRegistration): void {
    if (hasWaitingWorker(registration)) {
        handleUpdateAvailable()
    }

    registration.addEventListener('updatefound', () => {
        const installing = registration.installing
        if (installing) {
            watchInstallingWorker(installing)
        }
    })
}

async function checkForServiceWorkerUpdate(): Promise<void> {
    if (!swRegistration) return

    try {
        await swRegistration.update()
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn('Service worker update check failed:', error)
        }
    }

    if (hasWaitingWorker(swRegistration)) {
        handleUpdateAvailable()
    }
}

async function handleLongBackgroundReturn(): Promise<void> {
    if (!swRegistration) return

    await checkForServiceWorkerUpdate()

    if (hasWaitingWorker(swRegistration) || pwaNeedRefresh.value) {
        await applySilentUpdate()
    }
}

function scheduleServiceWorkerUpdateCheck(registration: ServiceWorkerRegistration): void {
    swRegistration = registration
    attachRegistrationListeners(registration)

    const check = () => {
        void checkForServiceWorkerUpdate()
    }

    check()

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            markPwaHidden()
            return
        }

        if (document.visibilityState === 'visible') {
            if (shouldForcePwaReloadAfterBackground()) {
                void handleLongBackgroundReturn()
                return
            }
            check()
        }
    })

    window.addEventListener('focus', check)
    window.addEventListener('pageshow', () => {
        check()
    })
}

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (pwaUpdateInProgress.value) {
            scheduleReload()
        }
    })
}

export const applyPwaUpdate = registerSW({
    onNeedRefresh() {
        handleUpdateAvailable()
    },
    onNeedReload() {
        scheduleReload()
    },
    onRegisteredSW(_swUrl, registration) {
        if (registration) {
            scheduleServiceWorkerUpdateCheck(registration)
        }
    },
    onRegisterError(error) {
        console.error('Service worker registration failed:', error)
    },
})

export {applySilentUpdate}
