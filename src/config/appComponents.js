import GameAimHeader from '../components/GameAimHeader.vue'
import GameToolbar from '../components/GameToolbar.vue'
import GameOverlay from '../components/GameOverlay.vue'
import GameBoard from '../components/GameBoard.vue'
import GameAward from '../components/GameAward.vue'

export const defaultAppComponents = {
    GameAimHeader,
    GameToolbar,
    GameOverlay,
    GameBoard,
    GameAward,
}

export function resolveAppComponents(preset) {
    return {
        ...defaultAppComponents,
        ...preset.components,
    }
}
