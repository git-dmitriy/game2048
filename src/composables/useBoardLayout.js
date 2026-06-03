import {ref, computed, onMounted, onUnmounted} from 'vue'

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
 * Масштаб доски и CSS-переменные layout для корня приложения.
 * @param {import('../config/defaultPreset.js').defaultPreset} preset
 */
export function useBoardLayout(preset) {
    const board = preset.board
    const ratios = {...defaultLayoutRatios, ...preset.layout?.ratios}

    const boardSizePx = ref(board.defaultWidthPx)

    function fitBoardSizePx() {
        if (window.innerWidth < board.defaultWidthPx * board.mobileBreakpointRatio) {
            boardSizePx.value = window.innerWidth * board.mobileWidthRatio
        } else {
            boardSizePx.value = board.defaultWidthPx
        }
    }

    const layoutVars = computed(() => {
        const px = boardSizePx.value
        const shadowOffset = px / ratios.gameAimShadowDivisor + 'px'
        return {
            '--board-size': px + 'px',
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

    onMounted(() => {
        fitBoardSizePx()
        window.addEventListener('resize', fitBoardSizePx)
    })

    onUnmounted(() => {
        window.removeEventListener('resize', fitBoardSizePx)
    })

    return {boardSizePx, layoutVars, fitBoardSizePx}
}
