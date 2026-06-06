import {useGamePreset} from './useGamePreset'
import {resolveAppComponents} from '../config/appComponents'
import type {AppComponentsMap} from '../types/game'

export function useAppComponents(): Required<AppComponentsMap> {
    const preset = useGamePreset()
    return resolveAppComponents(preset)
}
