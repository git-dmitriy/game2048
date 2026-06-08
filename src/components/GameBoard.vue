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

<script setup lang="ts">
import {ref, onMounted, toRef} from 'vue'
import GameChip from './GameChip.vue'
import {useGamePreset} from '../composables/useGamePreset'
import {useBoardGeometry} from '../composables/useBoardGeometry'
import {useBoardInput} from '../composables/useBoardInput'
import {useBoardChipModel} from '../composables/useBoardChipModel'
import {useBoardGameLoop} from '../composables/useBoardGameLoop'
import type {Game2048Snapshot} from '../types/game'

const preset = useGamePreset()

const props = withDefaults(defineProps<{
  size: number
  listenOwnKeyEventsOnly?: boolean
  tabIndex?: number
  boardSizePx?: number
  animationTimeMs?: number
  moveDurationMs?: number
  moveEasing?: string
  started?: boolean
}>(), {
  listenOwnKeyEventsOnly: false,
  tabIndex: 1,
  boardSizePx: 0,
  animationTimeMs: 200,
  moveEasing: 'ease-out',
  started: false,
})

const emit = defineEmits<{
  started: []
  ended: []
  score: [payload: { score: number; scoreInc: number }]
  'aim-changed': [aim: number]
  'aim-reached': []
  'session-update': [snapshot: Game2048Snapshot]
}>()

const boardEl = ref<HTMLElement | null>(null)
const cellRefs = ref<HTMLElement[]>([])

const {boardStyle, cellStyle, cellSizePx, initAutoSize} = useBoardGeometry({
  size: toRef(props, 'size'),
  boardSizePx: toRef(props, 'boardSizePx'),
  boardEl,
})

const boardInput = useBoardInput({
  boardEl,
  listenOwnKeyEventsOnly: toRef(props, 'listenOwnKeyEventsOnly'),
  swipeSensitivity: preset.input.swipeSensitivity,
})

const chipModel = useBoardChipModel({
  size: toRef(props, 'size'),
  cellRefs,
})

const {cells, chipKey, setCellRef} = chipModel

const {restoreSession} = useBoardGameLoop({
  preset,
  size: toRef(props, 'size'),
  started: toRef(props, 'started'),
  animationTimeMs: toRef(props, 'animationTimeMs'),
  moveDurationMs: toRef(props, 'moveDurationMs'),
  chipModel,
  boardInput,
  callbacks: {
    onStarted: () => emit('started'),
    onEnded: () => emit('ended'),
    onScore: (payload) => emit('score', payload),
    onAimChanged: (aim) => emit('aim-changed', aim),
    onAimReached: () => emit('aim-reached'),
    onSessionUpdate: (snapshot) => emit('session-update', snapshot),
  },
})

defineExpose({restoreSession})

onMounted(() => {
  initAutoSize()
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
  touch-action: none;
}

.cell {
  background-color: var(--color-cell);
  position: relative;
  border-radius: 7%;
}
</style>
