import type {GameSession} from '../types/game'

export function isValidGameSession(session: unknown, expectedSize: number): session is GameSession {
    if (!session || typeof session !== 'object') return false

    const data = session as Record<string, unknown>
    const {size, score, board, gameEnded, gameAimReached} = data

    if (size !== expectedSize) return false
    if (typeof score !== 'number' || score < 0) return false
    if (typeof gameEnded !== 'boolean') return false
    if (typeof gameAimReached !== 'boolean') return false
    if (!Array.isArray(board) || board.length !== expectedSize) return false

    let hasTile = false

    for (const row of board) {
        if (!Array.isArray(row) || row.length !== expectedSize) return false
        for (const value of row) {
            if (typeof value !== 'number' || value < 0 || !Number.isInteger(value)) return false
            if (value > 0) hasTile = true
        }
    }

    return hasTile
}

export function boardHasTiles(board: number[][]): boolean {
    return board.some((row) => row.some((value) => value > 0))
}
