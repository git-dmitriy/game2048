import { createPreset } from './defaultPreset.js'

/**
 * Активный пресет приложения — главная точка кастомизации.
 * Правила, фичи, тайминги, строки, persistence: переопределяйте здесь.
 */
export const activePreset = createPreset({
  // Пример классического 2048:
  // rules: { spawnsPerMove: 1, initialSpawns: 2 },
  // features: { awardAnimation: 'none' },
  // timing: { animationMs: 150, moveMs: 150 },
  // persistence: { storage: 'none' },
})
