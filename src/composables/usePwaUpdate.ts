import {ref, watch} from 'vue'
import {applyPwaUpdate, pwaNeedRefresh, pwaUpdateInProgress} from '../pwa/register'
import {invokePwaBeforeReload} from '../pwa/updatePolicy'

export function usePwaUpdate() {
    const dismissed = ref(false)

    watch(pwaNeedRefresh, (value) => {
        if (value && !pwaUpdateInProgress.value) {
            dismissed.value = false
        }
    })

    const showPrompt = () => pwaNeedRefresh.value && !dismissed.value && !pwaUpdateInProgress.value

    function dismiss(): void {
        dismissed.value = true
    }

    async function applyUpdate(): Promise<void> {
        if (pwaUpdateInProgress.value) return

        pwaUpdateInProgress.value = true
        dismissed.value = true
        invokePwaBeforeReload()

        try {
            await applyPwaUpdate()
        } catch (error) {
            pwaUpdateInProgress.value = false
            dismissed.value = false
            console.error('Service worker update failed:', error)
        }
    }

    return {
        showPrompt,
        dismiss,
        applyUpdate,
    }
}
