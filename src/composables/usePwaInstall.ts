import {ref, onMounted} from 'vue'

const INSTALL_DISMISS_KEY = 'game2048-pwa-install-dismissed'

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

function readDismissed(): boolean {
    try {
        return localStorage.getItem(INSTALL_DISMISS_KEY) === '1'
    } catch {
        return false
    }
}

function persistDismissed(): void {
    try {
        localStorage.setItem(INSTALL_DISMISS_KEY, '1')
    } catch {
    }
}

export function usePwaInstall() {
    const visible = ref(false)

    onMounted(() => {
        if (!isIosSafariBrowser()) return
        if (isStandaloneDisplayMode()) return
        if (readDismissed()) return
        visible.value = true
    })

    function dismiss(): void {
        visible.value = false
        persistDismissed()
    }

    return {
        visible,
        dismiss,
    }
}
