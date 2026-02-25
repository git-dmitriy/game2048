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
        :key="chipKey(ch, i)"
        ref="chips"
        :animation-time-ms="animationTimeMs"
        :chip="ch"
        :size-px="cellSizePx"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import GameChip from './GameChip.vue'
import { createGame2048 } from '../lib/game2048.js'
import { deferred } from '../lib/deferred.js'
import { createSwipeListener } from '../lib/swipe.js'

const keyMap = {}
keyMap[37] = 'left'
keyMap[38] = 'up'
keyMap[39] = 'right'
keyMap[40] = 'down'

const props = defineProps({
  size: { type: Number, required: true },
  sizeAimMap: { type: Array, required: true },
  listenOwnKeyEventsOnly: { type: Boolean, default: false },
  tabIndex: { type: Number, default: 1 },
  boardSizePx: { type: Number, default: 0 },
  animationTimeMs: { type: Number, default: 150 },
  started: { type: Boolean, default: false }
})

const emit = defineEmits(['started', 'ended', 'score', 'aim-changed', 'aim-reached'])

const boardEl = ref(null)
const cellRefs = ref([])
const boardSizeAutoPx = ref(0)

const aim = ref(props.sizeAimMap[props.size] ?? 2048)
const cells = ref(createCellsArray())

function createCellsArray() {
  return Array.from({ length: props.size * props.size }, () => ({ chips: [] }))
}

function setCellRef(el, index) {
  if (el) {
    if (!Array.isArray(cellRefs.value)) cellRefs.value = []
    cellRefs.value[index] = el
  }
}

function chipKey(ch, i) {
  return ch.value + '-' + i + '-' + (ch.prevRelPos ? 'm' : '')
}

const boardStyle = computed(() => ({
  width: props.boardSizePx > 0 ? props.boardSizePx + 'px' : '100%',
  height: props.boardSizePx > 0 ? props.boardSizePx + 'px' : '100%',
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

watch(() => props.size, () => {
  cells.value = createCellsArray()
  aim.value = props.sizeAimMap[props.size]
  emit('aim-changed', aim.value)
})

watch(() => props.started, (nv, ov) => {
  if (nv) {
    startGame()
  } else {
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
  const sw = createSwipeListener((m) => doGameMove(m))
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
  cells.value[getCellIndex(c)].chips.push({ value: c.value })
}

function addChips(chips) {
  chips.forEach(addChip)
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
  const boardChanges = { moves: [], consolidations: [] }
  const newChips = []
  const consolidateAndAddChipsDeferred = deferred(props.animationTimeMs, () => {
    consolidateChips(boardChanges.consolidations)
    addChips(newChips)
  })

  return function (m) {
    consolidateAndAddChipsDeferred.finish()

    const result = game[m]()
    boardChanges.moves = result.moves || []
    boardChanges.consolidations = result.consolidations || []
    newChips.length = 0
    if (result.moves && result.moves.length > 0) {
      for (let i = Math.max(1, props.size - 3); i > 0; i--) {
        const chips = game.turn()
        newChips.push(...chips)
      }
      if (result.scoreInc > 0) {
        emit('score', { score: game.score(), scoreInc: result.scoreInc })
        for (let i = 0; i < boardChanges.consolidations.length; i++) {
          if (boardChanges.consolidations[i].value === aim.value) {
            emit('aim-reached')
            break
          }
        }
      }
    }

    moveChips(boardChanges.moves)
    consolidateAndAddChipsDeferred.renew()
    if (!game.canMove()) {
      setTimeout(() => {
        endGame()
      }, props.animationTimeMs)
    }
  }
}

function startGame() {
  emptyCells()
  const game = createGame2048(props.size)
  for (let i = Math.max(2, props.size - 2); i > 0; i--) {
    const chips = game.turn()
    addChips(chips)
  }
  const doGameMove = createGameMove(game)
  runKeyboardControl(doGameMove)
  runTouchControl(doGameMove)
  emit('started')
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
  emit('ended')
}

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
  background-color: #35495e;
  outline: none;
}

.cell {
  background-color: #41b883;
  position: relative;
  border-radius: 7%;
}
</style>
