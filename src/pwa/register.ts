import {ref} from 'vue'
import {registerSW} from 'virtual:pwa-register'

export const pwaNeedRefresh = ref(false)
export const pwaUpdateInProgress = ref(false)

let reloadScheduled = false

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
    onRegisterError(error) {
        console.error('Service worker registration failed:', error)
    },
})
