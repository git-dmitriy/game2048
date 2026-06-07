import type {InjectionKey} from 'vue'
import type {GamePreset, TileTheme} from '../types/game'

export const gamePresetKey: InjectionKey<GamePreset> = Symbol('gamePreset')
export const tileThemeKey: InjectionKey<TileTheme> = Symbol('tileTheme')
