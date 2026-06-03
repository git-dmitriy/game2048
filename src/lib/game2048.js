const DEFAULT_OPTIONS = {
  spawnFourProbability: 0.2,
}

/**
 * @param {number} size
 * @param {object} [options]
 * @param {number} [options.spawnFourProbability]
 * @param {(random: () => number) => number} [options.spawnValue]
 */
export function createGame2048(size, options = {}) {
  size = size || 4
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const pickSpawnValue =
    opts.spawnValue ??
    (() => (Math.random() < opts.spawnFourProbability ? 4 : 2))

  const size2 = size * size
  let score = 0

  const board = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 0)
  )

  function cellIsEmpty(c) {
    return board[c.y][c.x] === 0
  }

  function cellsEqual(c1, c2) {
    return board[c1.y][c1.x] === board[c2.y][c2.x]
  }

  function moveChip(cf, ct) {
    const tWasEmpty = cellIsEmpty(ct)
    const v = (board[ct.y][ct.x] += board[cf.y][cf.x])
    board[cf.y][cf.x] = 0
    return tWasEmpty ? 0 : v
  }

  function findRandomEmptyPos() {
    let r = Math.floor(Math.random() * size2)
    const c = {}
    for (let i = size2; i > 0; i--) {
      c.y = Math.floor(r / size)
      c.x = r % size
      if (cellIsEmpty(c)) return c
      r++
      if (r === size2) r = 0
    }
    return null
  }

  function rot0(c, x, y) {
    c.x = x
    c.y = y
  }
  function rot90(c, x, y) {
    c.x = y
    c.y = x
  }
  function rot180(c, x, y) {
    c.x = size - 1 - x
    c.y = y
  }
  function rot270(c, x, y) {
    c.x = y
    c.y = size - 1 - x
  }

  function move(rot) {
    let scoreInc = 0
    const moves = []
    const consolidations = []
    const c = {}
    const tc = {}
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
              from: { x: c.x, y: c.y },
              to: { x: tc.x, y: tc.y },
            })
            if (v > 0) {
              consolidations.push({ x: tc.x, y: tc.y, value: v })
              scoreInc += v
              score += v
            }
          }
        }
      }
    }
    return { moves, consolidations, scoreInc }
  }

  function turn() {
    const chips = []
    const p = findRandomEmptyPos()
    if (p != null) {
      const v = pickSpawnValue(Math.random)
      p.value = v
      board[p.y][p.x] = v
      chips.push(p)
    }
    return chips
  }

  /** Несколько спавнов подряд (после хода или при старте) */
  function spawnTiles(count) {
    const chips = []
    for (let i = 0; i < count; i++) {
      chips.push(...turn())
    }
    return chips
  }

  return {
    size,
    board,
    score: () => score,
    turn,
    spawnTiles,
    right: () => move(rot0),
    down: () => move(rot90),
    left: () => move(rot180),
    up: () => move(rot270),
    canMove() {
      const c = { y: 0 }
      const cr = { y: 0 }
      const cb = { y: 1 }
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
