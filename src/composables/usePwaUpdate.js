import {ref, watch} from 'vue'
import {useRegisterSW} from 'virtual:pwa-register/vue'

/**
 * Service worker registration with a user-controlled update prompt.
 */
export function usePwaUpdate() {
    const dismissed = ref(false)

    const {needRefresh, updateServiceWorker} = useRegisterSW({
        onRegisterError(error) {
            console.error('Service worker registration failed:', error)
        },
    })

    watch(needRefresh, (value) => {
        if (value) {
            dismissed.value = false
        }
    })

    const showPrompt = () => needRefresh.value && !dismissed.value

    function dismiss() {
        dismissed.value = true
    }

    async function applyUpdate() {
        await updateServiceWorker(true)
    }

    return {
        showPrompt,
        dismiss,
        applyUpdate,
    }
}
