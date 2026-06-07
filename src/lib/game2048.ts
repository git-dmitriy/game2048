import type {
    CellCoord,
    ChipCoord,
    Game2048Engine,
    Game2048MoveResult,
    Game2048Options,
} from '../types/game'

type Cell = CellCoord & { value?: number }

const DEFAULT_OPTIONS: Game2048Options = {
    spawnFourProbability: 0.2,
}

export function createGame2048(size = 4, options: Game2048Options = {}): Game2048Engine {
    const opts = {...DEFAULT_OPTIONS, ...options}
    const spawnFourProbability = opts.spawnFourProbability ?? 0.2
    const pickSpawnValue =
        opts.spawnValue ??
        (() => (Math.random() < spawnFourProbability ? 4 : 2))

    const size2 = size * size
    let score = 0

    const board = Array.from({length: size}, () =>
        Array.from({length: size}, () => 0),
    )

    function cellIsEmpty(c: Cell): boolean {
        return board[c.y][c.x] === 0
    }

    function cellsEqual(c1: Cell, c2: Cell): boolean {
        return board[c1.y][c1.x] === board[c2.y][c2.x]
    }

    function moveChip(cf: Cell, ct: Cell): number {
        const tWasEmpty = cellIsEmpty(ct)
        const v = (board[ct.y][ct.x] += board[cf.y][cf.x])
        board[cf.y][cf.x] = 0
        return tWasEmpty ? 0 : v
    }

    function findRandomEmptyPos(): Cell | null {
        let r = Math.floor(Math.random() * size2)
        const c: Cell = {x: 0, y: 0}
        for (let i = size2; i > 0; i--) {
            c.y = Math.floor(r / size)
            c.x = r % size
            if (cellIsEmpty(c)) return c
            r++
            if (r === size2) r = 0
        }
        return null
    }

    function rot0(c: Cell, x: number, y: number): void {
        c.x = x
        c.y = y
    }

    function rot90(c: Cell, x: number, y: number): void {
        c.x = y
        c.y = x
    }

    function rot180(c: Cell, x: number, y: number): void {
        c.x = size - 1 - x
        c.y = y
    }

    function rot270(c: Cell, x: number, y: number): void {
        c.x = y
        c.y = size - 1 - x
    }

    function move(rot: (c: Cell, x: number, y: number) => void): Game2048MoveResult {
        let scoreInc = 0
        const moves: Game2048MoveResult['moves'] = []
        const consolidations: ChipCoord[] = []
        const c: Cell = {x: 0, y: 0}
        const tc: Cell = {x: 0, y: 0}

        for (let y = 0; y < size; y++) {
            let s = size
            for (let x = size - 2; x >= 0; x--) {
                rot(c, x, y)
                if (!cellIsEmpty(c)) {
                    let tx = x
                    while (tx + 1 < s) {
                        rot(tc, tx + 1, y)
                        if (!cellIsEmpty(tc)) {
                            if (cellsEqual(c, tc)) {
                                tx++
                                s = tx
                            }
                            break
                        }
                        tx++
                    }

                    if (x !== tx) {
                        rot(tc, tx, y)
                        const v = moveChip(c, tc)
                        moves.push({
                            from: {x: c.x, y: c.y},
                            to: {x: tc.x, y: tc.y},
                        })
                        if (v > 0) {
                            consolidations.push({x: tc.x, y: tc.y, value: v})
                            scoreInc += v
                            score += v
                        }
                    }
                }
            }
        }

        return {moves, consolidations, scoreInc}
    }

    function turn(): ChipCoord[] {
        const chips: ChipCoord[] = []
        const p = findRandomEmptyPos()
        if (p != null) {
            const v = pickSpawnValue(Math.random)
            p.value = v
            board[p.y][p.x] = v
            chips.push({x: p.x, y: p.y, value: v})
        }
        return chips
    }

    function spawnTiles(count: number): ChipCoord[] {
        const chips: ChipCoord[] = []
        for (let i = 0; i < count; i++) {
            chips.push(...turn())
        }
        return chips
    }

    function getSnapshot() {
        return {
            board: board.map((row) => [...row]),
            score,
        }
    }

    function loadSnapshot(snapshotBoard: number[][], snapshotScore: number): boolean {
        if (!Array.isArray(snapshotBoard) || snapshotBoard.length !== size) {
            return false
        }

        for (let y = 0; y < size; y++) {
            const row = snapshotBoard[y]
            if (!Array.isArray(row) || row.length !== size) {
                return false
            }
            for (let x = 0; x < size; x++) {
                const value = row[x]
                board[y][x] = typeof value === 'number' && value > 0 ? value : 0
            }
        }

        score = typeof snapshotScore === 'number' && snapshotScore >= 0 ? snapshotScore : 0
        return true
    }

    return {
        size,
        board,
        score: () => score,
        getSnapshot,
        loadSnapshot,
        turn,
        spawnTiles,
        right: () => move(rot0),
        down: () => move(rot90),
        left: () => move(rot180),
        up: () => move(rot270),
        canMove() {
            const c: Cell = {x: 0, y: 0}
            const cr: Cell = {x: 0, y: 0}
            const cb: Cell = {x: 0, y: 1}

            for (; c.y < size; c.y++, cr.y++, cb.y++) {
                for (c.x = 0, cr.x = 1, cb.x = 0; c.x < size; c.x++, cr.x++, cb.x++) {
                    if (
                        cellIsEmpty(c) ||
                        (cr.x < size && cellsEqual(c, cr)) ||
                        (cb.y < size && cellsEqual(c, cb))
                    ) {
                        return true
                    }
                }
            }

            return false
        },
    }
}
