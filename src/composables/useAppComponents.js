import {useGamePreset} from './useGamePreset.js'
import {resolveAppComponents} from '../config/appComponents.js'

export function useAppComponents() {
    const preset = useGamePreset()
    return resolveAppComponents(preset)
}
