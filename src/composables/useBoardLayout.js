import {ref, computed, watch, onUnmounted} from 'vue'

export const defaultLayoutRatios = {
    awardsHeight: 0.08,
    toolbarHeight: 0.16,
    gameOverSizeDivisor: 6,
    gameAimFontSizeDivisor: 85,
    buttonFontSizeDivisor: 450,
    scoreFontSizeDivisor: 280,
    awardFontSizeDivisor: 350,
    awardLikeHeightDivisor: 21,
    awardWidthDivisor: 5,
}

/**
 * @param {import('../config/defaultPreset.js').defaultPreset} preset
 */
export function getVerticalOverheadRatio(preset) {
    const ratios = {...defaultLayoutRatios, ...preset.layout?.ratios}
    const {features} = preset
    let overhead = 1 + ratios.toolbarHeight

    if (features.awards) {
        overhead += ratios.awardsHeight
    }

    overhead += 0.07
    return overhead
}

/**
 * @param {import('../config/defaultPreset.js').defaultPreset} preset
 * @param {import('vue').Ref<HTMLElement | null>} [containerRef]
 */
export function useBoardLayout(preset, containerRef) {
    const board = preset.board
    const ratios = {...defaultLayoutRatios, ...preset.layout?.ratios}

    const minPx = board.minWidthPx ?? 280
    const maxPx = board.maxWidthPx ?? board.defaultWidthPx ?? 420
    const widthRatio = board.horizontalWidthRatio ?? 0.96
    const verticalPaddingPx = board.layoutVerticalPaddingPx ?? 32
    const verticalOverhead = getVerticalOverheadRatio(preset)

    const boardSizePx = ref(0)
    let resizeObserver = null
    let resizeFallbackHandler = null

    const sizingVars = computed(() => ({
        '--board-min': minPx + 'px',
        '--board-max': maxPx + 'px',
        '--board-width-cap': `min(${widthRatio * 100}vw, ${maxPx}px)`,
        '--vertical-overhead': String(verticalOverhead),
        '--layout-vertical-padding': verticalPaddingPx + 'px',
    }))

    const layoutVars = computed(() => {
        const px = boardSizePx.value > 0 ? boardSizePx.value : maxPx

        return {
            '--toolbar-height': px * ratios.toolbarHeight + 'px',
            '--awards-height': px * ratios.awardsHeight + 'px',
            '--game-over-font-size': px / ratios.gameOverSizeDivisor + 'px',
            '--game-aim-font-size': px / ratios.gameAimFontSizeDivisor + 'em',
            '--button-font-size': px / ratios.buttonFontSizeDivisor + 'em',
            '--score-font-size': px / ratios.scoreFontSizeDivisor + 'em',
            '--award-width': px / ratios.awardWidthDivisor + 'px',
            '--award-font-size': px / ratios.awardFontSizeDivisor + 'em',
            '--award-like-height': px / ratios.awardLikeHeightDivisor + 'px',
        }
    })

    function syncBoardSizeFromElement(el) {
        const w = el?.getBoundingClientRect().width
        if (w > 0) {
            boardSizePx.value = Math.round(w)
        }
    }

    function attachResizeFallback(el) {
        if (resizeFallbackHandler) return

        resizeFallbackHandler = () => syncBoardSizeFromElement(el)
        window.addEventListener('resize', resizeFallbackHandler)
    }

    function observeContainer(el) {
        resizeObserver?.disconnect()
        resizeObserver = null

        if (!el) return

        syncBoardSizeFromElement(el)

        if (typeof ResizeObserver === 'undefined') {
            attachResizeFallback(el)
            return
        }

        resizeObserver = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect?.width
            if (w > 0) {
                boardSizePx.value = Math.round(w)
            }
        })
        resizeObserver.observe(el)
    }

    if (containerRef) {
        watch(
            containerRef,
            (el) => observeContainer(el),
            {flush: 'post', immediate: true},
        )
    }

    onUnmounted(() => {
        resizeObserver?.disconnect()
        resizeObserver = null
        if (resizeFallbackHandler) {
            window.removeEventListener('resize', resizeFallbackHandler)
            resizeFallbackHandler = null
        }
    })

    return {boardSizePx, sizingVars, layoutVars}
}
