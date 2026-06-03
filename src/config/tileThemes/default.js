const FONT_SIZE_COEFS = [1, 1, 0.8, 0.65, 0.5, 0.4, 0.35, 0.32]

const TILE_PALETTE = {
    2: {bg: '#87E293', color: 'white'},
    4: {bg: '#87E273', color: 'white'},
    8: {bg: '#eecf40', color: 'white'},
    16: {bg: '#ffaa4f', color: 'white'},
    32: {bg: '#6bcae2', color: 'white'},
    64: {bg: '#9ebbee', color: 'white'},
    128: {bg: 'white', color: '#2c3e50'},
    default: {bg: 'white', color: '#2c3e50'},
}

export const defaultTileTheme = {
    id: 'default',
    fontSizeCoefs: FONT_SIZE_COEFS,

    getPalette(value) {
        return TILE_PALETTE[value] ?? TILE_PALETTE.default
    },

    getChipStyle(value, sizePx) {
        const palette = this.getPalette(value)
        const n = Math.floor(Math.log(value) / Math.log(10))
        const base = Math.floor(sizePx / 1.5)
        const coefs = this.fontSizeCoefs
        const fontSize = base * (n < 8 ? coefs[n] : coefs[7])

        let boxShadow
        if (value < 256) {
            const s = sizePx * 0.1 + 'px '
            boxShadow = '0 ' + s + s + '0 black'
        } else {
            boxShadow =
                '0 0 20px ' +
                (2 + Math.min(10, Math.log(value) / Math.log(2) - 7)) +
                'px white'
        }

        return {
            fontSize: fontSize + 'px',
            backgroundColor: palette.bg,
            color: palette.color,
            boxShadow,
        }
    },
}
