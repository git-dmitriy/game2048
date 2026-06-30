import {computed, onBeforeUnmount, onMounted, ref} from 'vue'

const LEGACY_INSTALL_DISMISS_KEY = 'game2048-pwa-install-dismissed'
const IOS_INSTALL_DISMISS_KEY = 'game2048-pwa-install-dismissed-ios'
const CHROMIUM_INSTALL_DISMISS_KEY = 'game2048-pwa-install-dismissed-chromium'

export type PwaInstallMode = 'ios' | 'chromium'

interface NavigatorStandalone extends Navigator {
    standalone?: boolean
}

export function isStandaloneDisplayMode(): boolean {
    return (
        window.matchMedia('(display-mode: standalone)').matches
        || (window.navigator as NavigatorStandalone).standalone === true
    )
}

export function isIosDevice(): boolean {
    const ua = navigator.userAgent
    const isAppleMobile = /iPad|iPhone|iPod/.test(ua)
    const isIpadOs = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
    return isAppleMobile || isIpadOs
}

export function isIosSafariBrowser(): boolean {
    if (!isIosDevice()) return false
    return !/CriOS|FxiOS|EdgiOS|OPiOS|mercury/.test(navigator.userAgent)
}

function readDismissed(platform: PwaInstallMode): boolean {
    const key = platform === 'ios' ? IOS_INSTALL_DISMISS_KEY : CHROMIUM_INSTALL_DISMISS_KEY
    try {
        if (localStorage.getItem(key) === '1') return true
        if (platform === 'ios' && localStorage.getItem(LEGACY_INSTALL_DISMISS_KEY) === '1') {
            return true
        }
        return false
    } catch {
        return false
    }
}

function persistDismissed(platform: PwaInstallMode): void {
    const key = platform === 'ios' ? IOS_INSTALL_DISMISS_KEY : CHROMIUM_INSTALL_DISMISS_KEY
    try {
        localStorage.setItem(key, '1')
    } catch {
    }
}

export function usePwaInstall() {
    const visible = ref(false)
    const mode = ref<PwaInstallMode | null>(null)
    let deferredPrompt: BeforeInstallPromptEvent | null = null

    const canInstall = computed(() => mode.value === 'chromium' && deferredPrompt !== null)

    function showIosPrompt(): void {
        if (!isIosSafariBrowser()) return
        if (isStandaloneDisplayMode()) return
        if (readDismissed('ios')) return
        mode.value = 'ios'
        visible.value = true
    }

    function onBeforeInstallPrompt(event: Event): void {
        event.preventDefault()
        if (isStandaloneDisplayMode()) return
        if (readDismissed('chromium')) return

        deferredPrompt = event as BeforeInstallPromptEvent
        mode.value = 'chromium'
        visible.value = true
    }

    function onAppInstalled(): void {
        deferredPrompt = null
        visible.value = false
        mode.value = null
    }

    function dismiss(): void {
        if (mode.value) {
            persistDismissed(mode.value)
        }
        visible.value = false
    }

    async function install(): Promise<void> {
        if (!deferredPrompt) return

        try {
            await deferredPrompt.prompt()
            const {outcome} = await deferredPrompt.userChoice
            if (outcome === 'dismissed') {
                persistDismissed('chromium')
            }
        } catch (error) {
            if (import.meta.env.DEV) {
                console.warn('PWA install prompt failed:', error)
            }
        } finally {
            deferredPrompt = null
            visible.value = false
            mode.value = null
        }
    }

    onMounted(() => {
        showIosPrompt()
        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
        window.addEventListener('appinstalled', onAppInstalled)
    })

    onBeforeUnmount(() => {
        window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
        window.removeEventListener('appinstalled', onAppInstalled)
    })

    return {
        visible,
        mode,
        canInstall,
        dismiss,
        install,
    }
}
