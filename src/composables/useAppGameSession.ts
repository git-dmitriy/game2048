import {nextTick, type ComponentPublicInstance, type Ref} from 'vue'
import {isValidGameSession} from '../lib/gameSession'
import type {Game2048Snapshot, GameSession} from '../types/game'
import type {GameBoardExpose} from '../types/components'

interface AppGameSessionOptions {
    size: Ref<number>
    score: Ref<number>
    gameEnded: Ref<boolean>
    gameAimReached: Ref<boolean>
    savedSession: Ref<GameSession | null>
    gameRef: Ref<ComponentPublicInstance<GameBoardExpose> | null>
    persistState: () => void
    flushPersistState: () => void
    clearSession: () => void
}

export function useAppGameSession({
                                      size,
                                      score,
                                      gameEnded,
                                      gameAimReached,
                                      savedSession,
                                      gameRef,
                                      persistState,
                                      flushPersistState,
                                      clearSession,
                                  }: AppGameSessionOptions) {
    function updateSavedSession(overrides: Partial<GameSession> = {}): void {
        if (!savedSession.value) return

        savedSession.value = {
            ...savedSession.value,
            size: size.value,
            score: score.value,
            gameEnded: gameEnded.value,
            gameAimReached: gameAimReached.value,
            ...overrides,
        }
    }

    function onSessionUpdate({board, score: sessionScore}: Game2048Snapshot): void {
        savedSession.value = {
            size: size.value,
            score: sessionScore,
            board,
            gameEnded: gameEnded.value,
            gameAimReached: gameAimReached.value,
        }
        persistState()
    }

    async function restoreSavedSession(): Promise<void> {
        const session = savedSession.value
        if (!session || !isValidGameSession(session, size.value)) {
            if (session) clearSession()
            return
        }

        score.value = session.score
        gameEnded.value = session.gameEnded
        gameAimReached.value = session.gameAimReached

        await nextTick()

        const restored = gameRef.value?.restoreSession(
            {board: session.board, score: session.score},
            {interactive: !session.gameEnded},
        )

        if (!restored) {
            clearSession()
        }
    }

    function syncSessionOnEnd(): void {
        updateSavedSession({gameEnded: true})
        flushPersistState()
    }

    function syncSessionOnAimReached(): void {
        updateSavedSession({gameAimReached: true})
        flushPersistState()
    }

    return {
        onSessionUpdate,
        restoreSavedSession,
        syncSessionOnEnd,
        syncSessionOnAimReached,
    }
}
