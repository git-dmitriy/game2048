import ScoreContainer from '../components/ScoreContainer.vue'
import GameControls from '../components/GameControls.vue'
import GameOverlay from '../components/GameOverlay.vue'
import GameBoard from '../components/GameBoard.vue'
import GameAward from '../components/GameAward.vue'
import CollectAllBanner from '../components/CollectAllBanner.vue'

export const defaultAppComponents = {
    ScoreContainer,
    GameControls,
    GameOverlay,
    GameBoard,
    GameAward,
    CollectAllBanner,
}

export function resolveAppComponents(preset) {
    return {
        ...defaultAppComponents,
        ...preset.components,
    }
}
