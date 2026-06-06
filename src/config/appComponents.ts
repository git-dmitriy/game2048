import GameAimHeader from '../components/GameAimHeader.vue'
import GameToolbar from '../components/GameToolbar.vue'
import GameOverlay from '../components/GameOverlay.vue'
import GameBoard from '../components/GameBoard.vue'
import GameAward from '../components/GameAward.vue'
import type {AppComponentsMap, GamePreset} from '../types/game'

export const defaultAppComponents: Required<AppComponentsMap> = {
    GameAimHeader,
    GameToolbar,
    GameOverlay,
    GameBoard,
    GameAward,
}

export function resolveAppComponents(preset: GamePreset): Required<AppComponentsMap> {
    return {
        ...defaultAppComponents,
        ...preset.components,
    }
}
