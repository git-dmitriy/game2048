import type {Game2048Snapshot} from './game'

export interface GameBoardExpose {
    restoreSession: (
        session: Game2048Snapshot,
        options?: { interactive?: boolean },
    ) => boolean
}

export interface GameAimHeaderExpose {
    gameAimEl: { value: HTMLElement | null } | HTMLElement | null
}
