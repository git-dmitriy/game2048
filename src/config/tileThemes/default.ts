import type {TileTheme} from '../../types/game'

const FONT_SIZE_BY_POWER: Record<number, number> = {
    1: 1,
    2: 1,
    3: 0.92,
    4: 0.88,
    5: 0.82,
    6: 0.76,
    7: 0.7,
    8: 0.64,
    9: 0.58,
    10: 0.52,
    11: 0.46,
    12: 0.4,
    13: 0.36,
    14: 0.32,
    15: 0.28,
    16: 0.25,
}

const DEFAULT_FONT_COEF = 0.22

export const defaultTileTheme: TileTheme = {
    id: 'default',
    fontSizeByPower: FONT_SIZE_BY_POWER,

    getFontSizeCoef(value: number): number {
        const power = Math.round(Math.log2(value))
        return this.fontSizeByPower[power] ?? DEFAULT_FONT_COEF
    },

    getChipStyle(value: number, sizePx: number): Record<string, string> {
        const coef = this.getFontSizeCoef(value)
        const fontSize = Math.max(9, Math.floor((sizePx / 1.55) * coef))

        return {
            fontSize: fontSize + 'px',
        }
    },
}
