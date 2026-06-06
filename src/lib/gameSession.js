/**
 * @typedef {object} GameSession
 * @property {number} size
 * @property {number} score
 * @property {number[][]} board
 * @property {boolean} gameEnded
 * @property {boolean} gameAimReached
 */

/**
 * @param {unknown} session
 * @param {number} expectedSize
 * @returns {session is GameSession}
 */
export function isValidGameSession(session, expectedSize) {
  if (!session || typeof session !== 'object') return false

  const {size, score, board, gameEnded, gameAimReached} = session

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

/**
 * @param {number[][]} board
 * @returns {boolean}
 */
export function boardHasTiles(board) {
  return Array.isArray(board) && board.some((row) => row.some((value) => value > 0))
}
