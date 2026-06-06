<template>
  <div
      ref="boardEl"
      class="board"
      :tabindex="tabIndex"
      :style="boardStyle"
  >
    <div
        v-for="(cl, index) in cells"
        :ref="(el) => setCellRef(el, index)"
        :key="index"
        class="cell"
        :style="cellStyle"
    >
      <GameChip
          v-for="(ch, i) in cl.chips"
          :key="chipKey(ch)"
          ref="chips"
          :animation-time-ms="animationTimeMs"
          :move-duration-ms="moveDurationMs"
          :move-easing="moveEasing"
          :chip="ch"
          :size-px="cellSizePx"
      />
    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch, onMounted} from 'vue'
import GameChip from './GameChip.vue'
import {deferred} from '../lib/deferred.js'
import {createSwipeListener} from '../lib/swipe.js'
import {useGamePreset} from '../composables/useGamePreset.js'
import {
  createGame2048FromPreset,
  getInitialSpawns,
  getSpawnsPerMove,
  getWinTile,
} from '../config/defaultPreset.js'

const keyMap = {}
keyMap[37] = 'left'
keyMap[38] = 'up'
keyMap[39] = 'right'
keyMap[40] = 'down'

const preset = useGamePreset()

const props = defineProps({
  size: {type: Number, required: true},
  listenOwnKeyEventsOnly: {type: Boolean, default: false},
  tabIndex: {type: Number, default: 1},
  boardSizePx: {type: Number, default: 0},
  animationTimeMs: {type: Number, default: 150},
  /** Длительность анимации движения плиток (мс). По умолчанию = animationTimeMs */
  moveDurationMs: {type: Number, default: undefined},
  /** Easing анимации движения (CSS: ease-out, linear, cubic-bezier(...) и т.д.) */
  moveEasing: {type: String, default: 'ease-out'},
  started: {type: Boolean, default: false}
})

const emit = defineEmits(['started', 'ended', 'score', 'aim-changed', 'aim-reached', 'session-update'])

const boardEl = ref(null)
const cellRefs = ref([])
const boardSizeAutoPx = ref(0)

const aim = ref(getWinTile(preset, props.size))
const cells = ref(createCellsArray())

/** Уникальный id для каждой плитки при добавлении (чтобы ключ был стабильным до перемещения) */
let chipIdCounter = 0
/** Уникальный ключ при каждом перемещении — чтобы Vue создал новый инстанс и сработал enter */
let moveKeyCounter = 0

function createCellsArray() {
  return Array.from({length: props.size * props.size}, () => ({chips: []}))
}

function setCellRef(el, index) {
  if (el) {
    if (!Array.isArray(cellRefs.value)) cellRefs.value = []
    cellRefs.value[index] = el
  }
}

/**
 * Ключ должен меняться при перемещении, иначе Vue переиспользует компонент и enter не вызывается.
 * При перемещении используем _moveKey (новый инстанс → анимация входа).
 */
function chipKey(ch) {
  if (ch._moveKey != null) return 'move-' + ch._moveKey
  return 'chip-' + (ch._chipId != null ? ch._chipId : (ch._chipId = ++chipIdCounter))
}

const boardStyle = computed(() => ({
  width: '100%',
  height: '100%',
  borderRadius: 7 / props.size + '%'
}))

const cellSizePct = computed(() => 8 * cellMarginPct.value)
const cellMarginPct = computed(() => 100 / (9 * props.size + 1))

const cellStyle = computed(() => ({
  width: cellSizePct.value + '%',
  height: cellSizePct.value + '%',
  marginLeft: cellMarginPct.value + '%',
  marginTop: cellMarginPct.value + '%'
}))

const cellSizePx = computed(() => {
  const boardPx = props.boardSizePx > 0 ? props.boardSizePx : boardSizeAutoPx.value
  return (cellSizePct.value / 100) * boardPx
})

let keydownCleanup = null
let swipeDetach = null
/** @type {ReturnType<typeof createGame2048FromPreset> | null} */
let game = null
let skipAutostart = false

watch(() => props.boardSizePx, (px) => {
  if (px > 0) {
    boardSizeAutoPx.value = px
  }
})

watch(() => props.size, () => {
  cells.value = createCellsArray()
  aim.value = getWinTile(preset, props.size)
  emit('aim-changed', aim.value)
})

watch(() => props.started, (nv, ov) => {
  if (nv) {
    if (skipAutostart) {
      skipAutostart = false
      return
    }
    startGame()
  } else if (ov) {
    endGame()
  }
})

function runKeyboardControl(doGameMove) {
  const listenKeysOn = props.listenOwnKeyEventsOnly ? boardEl.value : document
  const h = (e) => {
    const m = keyMap[e.keyCode]
    if (m == null) return
    e.preventDefault()
    doGameMove(m)
  }
  listenKeysOn.addEventListener('keydown', h)
  keydownCleanup = () => {
    listenKeysOn.removeEventListener('keydown', h)
  }
}

function runTouchControl(doGameMove) {
  const sw = createSwipeListener((m) => doGameMove(m), {
    sensitivity: preset.input.swipeSensitivity,
  })
  const el = boardEl.value
  if (el) {
    sw.attach(el)
    swipeDetach = () => sw.detach(el)
  }
}

function getCellIndex(c) {
  return c.y * props.size + c.x
}

function getCell(c) {
  return cells.value[getCellIndex(c)]
}

function getCellEl(c) {
  const refs = cellRefs.value
  return Array.isArray(refs) ? refs[getCellIndex(c)] : null
}

function emptyCells() {
  cells.value.forEach((c) => c.chips.splice(0))
}

function addChip(c) {
  const chip = {value: c.value, _chipId: ++chipIdCounter}
  cells.value[getCellIndex(c)].chips.push(chip)
}

function addChips(chips) {
  chips.forEach(addChip)
}

function populateChipsFromBoard(board) {
  for (let y = 0; y < props.size; y++) {
    for (let x = 0; x < props.size; x++) {
      const value = board[y][x]
      if (value > 0) {
        addChip({x, y, value})
      }
    }
  }
}

function emitSessionUpdate() {
  if (!game) return
  emit('session-update', game.getSnapshot())
}

function moveChip(from, to) {
  const fcell = getCell(from)
  const fcellEl = getCellEl(from)
  const tcell = getCell(to)
  const tcellEl = getCellEl(to)
  const chip = fcell.chips.splice(0, 1)[0]
  if (!fcellEl || !tcellEl) return
  const fboundRect = fcellEl.getBoundingClientRect()
  const tboundRect = tcellEl.getBoundingClientRect()
  chip.prevRelPos = {
    left: fboundRect.left - tboundRect.left,
    top: fboundRect.top - tboundRect.top
  }
  chip._moveKey = ++moveKeyCounter
  tcell.chips.push(chip)
}

function moveChips(moves) {
  moves.forEach((m) => moveChip(m.from, m.to))
}

function consolidateChips(consolidations) {
  consolidations.forEach((c) => {
    const cell = getCell(c)
    const chips = cell.chips
    chips.splice(0, chips.length - 1)
    chips[0].value = c.value
  })
}

function createGameMove(game) {
  const boardChanges = {moves: [], consolidations: []}
  const newChips = []
  const moveDuration = props.moveDurationMs ?? props.animationTimeMs
  /** Не принимаем новый ход, пока не закончится анимация движения текущего хода */
  let moveCooldownUntil = 0

  const consolidateAndAddChipsDeferred = deferred(props.animationTimeMs, () => {
    consolidateChips(boardChanges.consolidations)
    addChips(newChips)
  })

  return function (m) {
    if (Date.now() < moveCooldownUntil) return

    consolidateAndAddChipsDeferred.finish()

    const result = game[m]()
    boardChanges.moves = result.moves || []
    boardChanges.consolidations = result.consolidations || []
    newChips.length = 0
    if (result.moves && result.moves.length > 0) {
      newChips.push(...game.spawnTiles(getSpawnsPerMove(preset, props.size)))
      if (result.scoreInc > 0) {
        emit('score', {score: game.score(), scoreInc: result.scoreInc})
        for (let i = 0; i < boardChanges.consolidations.length; i++) {
          if (boardChanges.consolidations[i].value === aim.value) {
            emit('aim-reached')
            break
          }
        }
      }
    }

    moveChips(boardChanges.moves)
    if (boardChanges.moves.length > 0) {
      moveCooldownUntil = Date.now() + moveDuration
    }
    consolidateAndAddChipsDeferred.renew()
    emitSessionUpdate()
    if (!game.canMove()) {
      setTimeout(() => {
        endGame()
      }, props.animationTimeMs)
    }
  }
}

function attachControls(doGameMove) {
  runKeyboardControl(doGameMove)
  runTouchControl(doGameMove)
}

function startGame() {
  emptyCells()
  chipIdCounter = 0
  moveKeyCounter = 0
  game = createGame2048FromPreset(preset, props.size)
  addChips(game.spawnTiles(getInitialSpawns(preset, props.size)))
  attachControls(createGameMove(game))
  emitSessionUpdate()
  emit('started')
}

/**
 * @param {{ board: number[][], score: number }} session
 * @param {{ interactive?: boolean }} [options]
 */
function restoreSession(session, options = {}) {
  const interactive = options.interactive !== false

  endGame()
  emptyCells()
  chipIdCounter = 0
  moveKeyCounter = 0
  game = createGame2048FromPreset(preset, props.size)

  if (!game.loadSnapshot(session.board, session.score)) {
    game = null
    return false
  }

  populateChipsFromBoard(session.board)

  if (interactive) {
    skipAutostart = true
    attachControls(createGameMove(game))
    emit('started')
  }

  emitSessionUpdate()
  return true
}

function endGame() {
  if (keydownCleanup) {
    keydownCleanup()
    keydownCleanup = null
  }
  if (swipeDetach) {
    swipeDetach()
    swipeDetach = null
  }
  emitSessionUpdate()
  emit('ended')
}

defineExpose({
  restoreSession,
})

onMounted(() => {
  boardSizeAutoPx.value =
      props.boardSizePx > 0 ? props.boardSizePx : boardEl.value?.getBoundingClientRect().width || 0
})
</script>

<style scoped>
.board {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  align-items: space-around;
  background-color: var(--color-board);
  outline: none;
}

.cell {
  background-color: var(--color-cell);
  position: relative;
  border-radius: 7%;
}
</style>

