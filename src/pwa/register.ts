import {ref} from 'vue'
import {registerSW} from 'virtual:pwa-register'

export const pwaNeedRefresh = ref(false)
export const pwaUpdateInProgress = ref(false)

let reloadScheduled = false

function scheduleServiceWorkerUpdateCheck(registration: ServiceWorkerRegistration): void {
    const check = () => {
        void registration.update()
    }

    check()
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            check()
        }
    })
    window.addEventListener('focus', check)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            check()
        }
    })
}

export const applyPwaUpdate = registerSW({
    onNeedRefresh() {
        if (!pwaUpdateInProgress.value) {
            pwaNeedRefresh.value = true
        }
    },
    onNeedReload() {
        if (reloadScheduled) return
        reloadScheduled = true
        window.location.reload()
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
