import { inject } from 'vue'
import { gamePresetKey } from '../config/injectionKeys.js'
import { defaultPreset } from '../config/defaultPreset.js'

export function useGamePreset() {
  const preset = inject(gamePresetKey)
  if (!preset) {
    if (import.meta.env.DEV) {
      console.warn('[useGamePreset] preset not provided, using defaultPreset')
    }
    return defaultPreset
  }
  return preset
}
