<template>
  <div
      ref="appEl"
      class="main-container appearing"
      :style="[layoutVars, { visibility: isVisible ? 'visible' : 'hidden' }]"
  >
    <ScoreContainer
        ref="scoreContainerRef"
        :score="score"
        :score-inc="scoreInc"
        :best-score="bestScore[size]"
        :game-aim="gameAim"
        :game-aim-reached="gameAimReached"
    />
    <GameControls
        :game-started="gameStarted"
        :sizes="sizes"
        :model-value="size"
        @update:model-value="onSizeChange"
        @start="startGame"
        @end="gameStarted = false"
    />
    <div class="game-container">
      <GameOverlay :visible="gameEnded"/>
      <GameBoard
          ref="gameRef"
          :size="size"
          :listen-own-key-events-only="listenOwnKeyEventsOnly"
          :tab-index="1"
          :board-size-px="boardSizePx"
          :started="gameStarted"
          :animation-time-ms="timing.animationMs"
          :move-duration-ms="timing.moveMs"
          :move-easing="timing.moveEasing"
          @started="onGameStarted"
          @ended="onGameEnded"
          @score="onGameScore"
          @aim-changed="onGameAimChanged"
          @aim-reached="onGameAimReached"
      />
    </div>
    <div v-if="features.awards" class="game-awards-container">
      <GameAward
          v-for="a in awardsList"
          :ref="(el) => setAwardRef(el, a.aim)"
          :key="a.aim"
          :award="a"
      />
    </div>
    <div
        v-if="features.collectAllBanner"
        v-show="!allAwardsObtained"
        ref="collectAllAwardsRef"
        class="collect-all-awards"
    >
      <span>Collect all awards!</span>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, computed, watch, onMounted, nextTick} from 'vue'
import {gsap} from 'gsap'
import ScoreContainer from './components/ScoreContainer.vue'
import GameControls from './components/GameControls.vue'
import GameOverlay from './components/GameOverlay.vue'
import GameBoard from './components/GameBoard.vue'
import GameAward from './components/GameAward.vue'
import {useGamePreset} from './composables/useGamePreset.js'
import {useBoardLayout} from './composables/useBoardLayout.js'
import {getBoardSizes, getWinTile} from './config/defaultPreset.js'

const preset = useGamePreset()
const {board, timing, features, input} = preset
const {boardSizePx, layoutVars, fitBoardSizePx} = useBoardLayout(preset)

const defSize = board.defaultSize
const listenOwnKeyEventsOnly = input.listenKeysOn === 'board'

const awards = reactive({})
const bestScore = reactive({})
const sizes = getBoardSizes(preset)
for (const s of sizes) {
  const a = getWinTile(preset, s)
  bestScore[s] = 0
  awards[a] = {aim: a, obtained: false}
}

const appEl = ref(null)
const scoreContainerRef = ref(null)
const gameRef = ref(null)
const collectAllAwardsRef = ref(null)
const awardRefs = ref({})

const size = ref(defSize)
const gameStarted = ref(false)
const gameEnded = ref(false)
const gameAim = ref(getWinTile(preset, defSize))
const gameAimReached = ref(false)
const score = ref(0)
const scoreInc = ref('')
const isVisible = ref(false)

const awardsList = computed(() => Object.values(awards))

const allAwardsObtained = computed(() => {
  for (const key in awards) {
    if (!awards[key].obtained) return false
  }
  return true
})

function setAwardRef(el, aim) {
  if (el) {
    awardRefs.value[aim] = el
  }
}

function onSizeChange(v) {
  size.value = v
}

function loadState() {
  try {
    const s = document.cookie
    if (s) {
      const state = JSON.parse(s)
      if (state) {
        if (state.awards) Object.assign(awards, state.awards)
        if (state.bestScore) Object.assign(bestScore, state.bestScore)
      }
    }
  } catch (e) {
  }
}

function persistState() {
  try {
    const state = {
      bestScore: {...bestScore},
      awards: {...awards},
    }
    document.cookie = JSON.stringify(state)
  } catch (e) {
  }
}

function startGame() {
  gameStarted.value = true
  score.value = 0
  if (features.collectAllBanner) {
    showCollectAllAwards()
  }
}

function onGameStarted() {
  gameStarted.value = true
  gameEnded.value = false
}

function onGameEnded() {
  gameStarted.value = false
  gameEnded.value = true
  gameAimReached.value = false
  persistState()
}

function onGameScore(args) {
  if (features.scoreAnimation !== 'gsap') {
    score.value = args.score
    if (features.bestScorePerSize && args.score > bestScore[size.value]) {
      bestScore[size.value] = args.score
    }
    scoreInc.value = args.scoreInc + '+'
    nextTick(() => {
      scoreInc.value = ''
    })
    return
  }

  const s = {score: score.value}
  gsap.to(s, {
    duration: 0.3,
    score: args.score,
    ease: 'none',
    onUpdate: () => {
      score.value = Math.floor(s.score)
    },
  })

  if (features.bestScorePerSize && args.score > bestScore[size.value]) {
    const bs = {score: bestScore[size.value]}
    gsap.to(bs, {
      duration: 0.3,
      score: args.score,
      ease: 'none',
      onUpdate: () => {
        bestScore[size.value] = Math.floor(bs.score)
      },
    })
  }

  scoreInc.value = args.scoreInc + '+'
  nextTick(() => {
    scoreInc.value = ''
  })
}

function onGameAimChanged(aim) {
  gameAim.value = aim
}

function onGameAimReached() {
  gameAimReached.value = true
  if (features.awards && awards[gameAim.value]) {
    awards[gameAim.value].obtained = true
  }
  persistState()

  if (!features.awards) return

  const awardEl = awardRefs.value[gameAim.value]?.$el
  const gameAimEl =
      scoreContainerRef.value?.gameAimEl?.value ?? scoreContainerRef.value?.gameAimEl
  if (awardEl && gameAimEl) {
    const p1 = gameAimEl.getBoundingClientRect()
    const p2 = awardEl.getBoundingClientRect()
    const ws = p1.width / p2.width
    const hs = p1.height / p2.height
    const x = p1.left - p2.left + p1.width / 4
    const y = p1.top - p2.top + p1.height / 2

    const s = awardEl.style
    s.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + ws + ',' + hs + ')'
    s.transition = ''
    s.zIndex = 100
    requestAnimationFrame(() => {
      s.transition = 'all 2s'
      s.transform = ''
    })
  }
}

function showCollectAllAwards() {
  const el = collectAllAwardsRef.value
  if (el) {
    const s = el.style
    s.animation = ''
    requestAnimationFrame(() => {
      s.animation = 'collect-all-awards 10s'
    })
  }
}

watch(size, () => {
  gameEnded.value = false
})

onMounted(() => {
  loadState()
  requestAnimationFrame(() => {
    fitBoardSizePx()
    requestAnimationFrame(() => {
      isVisible.value = true
      if (features.collectAllBanner) {
        showCollectAllAwards()
      }
    })
  })
})
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 2%;
  width: var(--board-size);
  transform: translateZ(0);
}

.game-container {
  position: relative;
  width: var(--board-size);
  height: var(--board-size);
}

.game-awards-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 2%;
  height: var(--awards-height);
}

.collect-all-awards {
  text-align: center;
  width: 100%;
  opacity: 0;
  margin-top: 4px;
}

.collect-all-awards span {
  border: 1px solid var(--color-text);
  border-radius: 7% / 50%;
  padding: 0 3px;
}

.appearing {
  animation: appearing 1s;
}

@keyframes appearing {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes collect-all-awards {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  60% {
    transform: translateY(20px);
    opacity: 0;
  }
  65% {
    opacity: 1;
    transform: translateY(0);
  }
  78% {
    transform: translateX(0);
    opacity: 1;
  }
  79% {
    transform: translateX(5px);
    opacity: 1;
  }
  80% {
    transform: translateX(-5px);
    opacity: 1;
  }
  81% {
    transform: translateX(5px);
    opacity: 1;
  }
  82% {
    transform: translateX(-5px);
    opacity: 1;
  }
  83% {
    transform: translateX(5px);
    opacity: 1;
  }
  84% {
    transform: translateX(-5px);
    opacity: 1;
  }
  85% {
    transform: translateX(5px);
    opacity: 1;
  }
  86% {
    transform: translateX(-5px);
    opacity: 1;
  }
  87% {
    transform: translateX(5px);
    opacity: 1;
  }
  88% {
    transform: translateX(-5px);
    opacity: 1;
  }
  89% {
    transform: translateX(0);
    opacity: 1;
  }
  99% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateY(20px);
    opacity: 0;
  }
}
</style>
