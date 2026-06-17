import {ref, watch, type MaybeRefOrGetter, toValue} from 'vue'
import {deferred} from '../lib/deferred'
import {
    createGame2048FromPreset,
    getInitialSpawns,
    getSpawnsPerMove,
    getWinTile,
} from '../config/defaultPreset'
import type {
    CellCoord,
    ChipCoord,
    Game2048Engine,
    Game2048Snapshot,
    GamePreset,
    MoveDirection,
} from '../types/game'

export interface BoardChipModelApi {
    reset: (boardSize?: number) => void
    addChips: (chips: ChipCoord[]) => void
    populateFromBoard: (board: number[][]) => void
    moveChips: (moves: Array<{ from: CellCoord; to: CellCoord }>) => void
    consolidateChips: (consolidations: ChipCoord[]) => void
}

export interface BoardInputApi {
    attach: (handler: (direction: MoveDirection) => void) => void
    detach: () => void
}

export interface BoardGameLoopCallbacks {
    onStarted: () => void
    onEnded: () => void
    onScore: (payload: { score: number; scoreInc: number }) => void
    onAimChanged: (aim: number) => void
    onAimReached: () => void
    onSessionUpdate: (snapshot: Game2048Snapshot) => void
    onMove?: () => void
    onMerge?: (consolidations: ChipCoord[]) => void
    onSpawn?: (count: number) => void
}

interface BoardGameLoopOptions {
    preset: GamePreset
    size: MaybeRefOrGetter<number>
    started: MaybeRefOrGetter<boolean>
    animationTimeMs: MaybeRefOrGetter<number>
    moveDurationMs: MaybeRefOrGetter<number | undefined>
    chipModel: BoardChipModelApi
    boardInput: BoardInputApi
    callbacks: BoardGameLoopCallbacks
}

export function useBoardGameLoop({
                                     preset,
                                     size,
                                     started,
                                     animationTimeMs,
                                     moveDurationMs,
                                     chipModel,
                                     boardInput,
                                     callbacks,
                                 }: BoardGameLoopOptions) {
    const aim = ref(getWinTile(preset, toValue(size)))

    let game: Game2048Engine | null = null
    let skipAutostart = false

    function emitSessionUpdate(): void {
        if (!game) return
        callbacks.onSessionUpdate(game.getSnapshot())
    }

    function createGameMove(engine: Game2048Engine) {
        const boardChanges: {
            moves: Array<{ from: CellCoord; to: CellCoord }>
            consolidations: ChipCoord[]
        } = {moves: [], consolidations: []}
        const newChips: ChipCoord[] = []
        const moveDuration = toValue(moveDurationMs) ?? toValue(animationTimeMs)
        let moveCooldownUntil = 0

        const consolidateAndAddChipsDeferred = deferred(toValue(animationTimeMs), () => {
            if (boardChanges.consolidations.length > 0) {
                callbacks.onMerge?.(boardChanges.consolidations)
            }
            chipModel.consolidateChips(boardChanges.consolidations)
            if (newChips.length > 0) {
                callbacks.onSpawn?.(newChips.length)
            }
            chipModel.addChips(newChips)
        })

        return function (direction: MoveDirection) {
            if (Date.now() < moveCooldownUntil) return

            consolidateAndAddChipsDeferred.finish()

            const result = engine[direction]()
            boardChanges.moves = result.moves || []
            boardChanges.consolidations = result.consolidations || []
            newChips.length = 0

            if (result.moves && result.moves.length > 0) {
                newChips.push(...engine.spawnTiles(getSpawnsPerMove(preset, toValue(size))))
                if (result.scoreInc > 0) {
                    callbacks.onScore({score: engine.score(), scoreInc: result.scoreInc})
                    for (const consolidation of boardChanges.consolidations) {
                        if (consolidation.value === aim.value) {
                            callbacks.onAimReached()
                            break
                        }
                    }
                }
            }

            chipModel.moveChips(boardChanges.moves)
            if (boardChanges.moves.length > 0) {
                callbacks.onMove?.()
                moveCooldownUntil = Date.now() + moveDuration
            }
            consolidateAndAddChipsDeferred.renew()
            emitSessionUpdate()

            if (!engine.canMove()) {
                setTimeout(() => {
                    endGame()
                }, toValue(animationTimeMs))
            }
        }
    }

    function startGame(): void {
        chipModel.reset()
        game = createGame2048FromPreset(preset, toValue(size))
        chipModel.addChips(game.spawnTiles(getInitialSpawns(preset, toValue(size))))
        boardInput.attach(createGameMove(game))
        emitSessionUpdate()
        callbacks.onStarted()
    }

    function restoreSession(
        session: Game2048Snapshot,
        options: { interactive?: boolean } = {},
    ): boolean {
        const interactive = options.interactive !== false

        endGame()
        chipModel.reset()
        game = createGame2048FromPreset(preset, toValue(size))

        if (!game.loadSnapshot(session.board, session.score)) {
            game = null
            return false
        }

        chipModel.populateFromBoard(session.board)

        if (interactive) {
            skipAutostart = true
            boardInput.attach(createGameMove(game))
            callbacks.onStarted()
        }

        emitSessionUpdate()
        return true
    }

    function endGame(): void {
        boardInput.detach()
        emitSessionUpdate()
        callbacks.onEnded()
    }

    watch(
        () => toValue(size),
        () => {
            chipModel.reset()
            aim.value = getWinTile(preset, toValue(size))
            callbacks.onAimChanged(aim.value)
        },
    )

    watch(
        () => toValue(started),
        (startedNow, wasStarted) => {
            if (startedNow) {
                if (skipAutostart) {
                    skipAutostart = false
                    return
                }
                startGame()
            } else if (wasStarted) {
                endGame()
            }
        },
    )

    return {
        aim,
        startGame,
        restoreSession,
        endGame,
    }
}
