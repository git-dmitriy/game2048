import {ref, computed, watch, onUnmounted} from 'vue'

export const defaultLayoutRatios = {
    controlsHeight: 0.2,
    scoreHeight: 0.2,
    awardsHeight: 0.08,
    gameOverSizeDivisor: 6,
    gameAimFontSizeDivisor: 110,
    gameAimShadowDivisor: 50,
    buttonFontSizeDivisor: 450,
    scoreFontSizeDivisor: 280,
    awardWidthDivisor: 5,
    awardFontSizeDivisor: 350,
    awardLikeHeightDivisor: 21,
}

/**
 * Суммарная доля высоты UI относительно доски (доска = 1).
 * Учитывает панели из layout.ratios и опциональные блоки из features.
 * @param {import('../config/defaultPreset.js').defaultPreset} preset
 */
export function getVerticalOverheadRatio(preset) {
    const ratios = {...defaultLayoutRatios, ...preset.layout?.ratios}
    const {features} = preset
    let overhead = 1 + ratios.scoreHeight + ratios.controlsHeight

    if (features.awards) {
        overhead += ratios.awardsHeight + 0.02
    }
    if (features.collectAllBanner) {
        overhead += 0.04
    }

    overhead += 0.04
    return overhead
}

/**
 * Масштаб доски: CSS clamp задаёт визуальный размер, ResizeObserver синхронизирует px для анимаций.
 * @param {import('../config/defaultPreset.js').defaultPreset} preset
 * @param {import('vue').Ref<HTMLElement | null>} [containerRef] — .game-container
 */
export function useBoardLayout(preset, containerRef) {
    const board = preset.board
    const ratios = {...defaultLayoutRatios, ...preset.layout?.ratios}

    const minPx = board.minWidthPx ?? 280
    const maxPx = board.maxWidthPx ?? board.defaultWidthPx ?? 420
    const widthRatio = board.horizontalWidthRatio ?? board.mobileWidthRatio ?? 0.96
    const verticalPaddingPx = board.layoutVerticalPaddingPx ?? 32
    const verticalOverhead = getVerticalOverheadRatio(preset)

    /** 0 до первого измерения ResizeObserver; layoutVars до измерения использует maxPx */
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
        const shadowOffset = px / ratios.gameAimShadowDivisor + 'px'
        return {
            '--controls-height': px * ratios.controlsHeight + 'px',
            '--score-panel-height': px * ratios.scoreHeight + 'px',
            '--awards-height': px * ratios.awardsHeight + 'px',
            '--game-over-font-size': px / ratios.gameOverSizeDivisor + 'px',
            '--game-aim-font-size': px / ratios.gameAimFontSizeDivisor + 'em',
            '--game-aim-shadow': `0 ${shadowOffset} ${shadowOffset} var(--color-shadow)`,
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
