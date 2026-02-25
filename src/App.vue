<template>
  <div
    ref="appEl"
    class="main-container appearing"
    :style="[mainContainerStyle, { visibility: isVisible ? 'visible' : 'hidden' }]"
  >
    <ScoreContainer
      ref="scoreContainerRef"
      :score="score"
      :score-inc="scoreInc"
      :best-score="bestScore[size]"
      :game-aim="gameAim"
      :game-aim-reached="gameAimReached"
      :container-style="scoreContainerStyle"
      :game-aim-style="gameAimStyle"
      :score-style="scoreStyle"
    />
    <GameControls
      :game-started="gameStarted"
      :sizes="sizes"
      :model-value="size"
      @update:model-value="onSizeChange"
      @start="startGame"
      @end="gameStarted = false"
      :controls-style="gameControlsStyle"
      :button-style="buttonStyle"
    />
    <div class="game-container" :style="gameContainerStyle">
      <GameOverlay
        :visible="gameEnded"
        :game-over-style="gameOverStyle"
      />
      <GameBoard
        ref="gameRef"
        :size="size"
        :size-aim-map="sizeAimMap"
        :listen-own-key-events-only="false"
        :tab-index="1"
        :board-size-px="boardSizePx"
        :started="gameStarted"
        @started="onGameStarted"
        @ended="onGameEnded"
        @score="onGameScore"
        @aim-changed="onGameAimChanged"
        @aim-reached="onGameAimReached"
      />
    </div>
    <div class="game-awards-container" :style="gameAwardsContainerStyle">
      <GameAward
        v-for="a in awardsList"
        :ref="(el) => setAwardRef(el, a.aim)"
        :key="a.aim"
        :award="a"
        :custom-style="gameAwardStyle"
        :like-style="gameAwardLikeStyle"
      />
    </div>
    <div
      v-show="!allAwardsObtained"
      ref="collectAllAwardsRef"
      class="collect-all-awards"
    >
      <span>Collect all awards!</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import ScoreContainer from './components/ScoreContainer.vue'
import GameControls from './components/GameControls.vue'
import GameOverlay from './components/GameOverlay.vue'
import GameBoard from './components/GameBoard.vue'
import GameAward from './components/GameAward.vue'

const defBoardSizePx = 420
const defSize = 4

const sizeAimMap = []
sizeAimMap[3] = 256
sizeAimMap[4] = 2048
sizeAimMap[5] = 4096
sizeAimMap[6] = 8192

const awards = reactive({})
const bestScore = reactive({})
const sizes = []
for (const s in sizeAimMap) {
  const a = sizeAimMap[s]
  bestScore[s] = 0
  awards[a] = { aim: a, obtained: false }
  sizes.push(Number(s))
}

const appEl = ref(null)
const scoreContainerRef = ref(null)
const gameRef = ref(null)
const collectAllAwardsRef = ref(null)
const awardRefs = ref({})

const boardSizePx = ref(defBoardSizePx)
const size = ref(defSize)
const gameStarted = ref(false)
const gameEnded = ref(false)
const gameAim = ref(sizeAimMap[defSize])
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

const gameOverStyle = computed(() => ({
  fontSize: boardSizePx.value / 6 + 'px'
}))

const gameContainerStyle = computed(() => ({
  width: boardSizePx.value + 'px',
  height: boardSizePx.value + 'px'
}))

const mainContainerStyle = computed(() => ({
  width: boardSizePx.value + 'px'
}))

const gameControlsStyle = computed(() => ({
  height: boardSizePx.value * 0.2 + 'px'
}))

const scoreContainerStyle = computed(() => ({
  height: boardSizePx.value * 0.2 + 'px'
}))

const gameAimStyle = computed(() => {
  const bsh = boardSizePx.value / 50 + 'px '
  return {
    boxShadow: '0 ' + bsh + bsh + 'black',
    fontSize: boardSizePx.value / 110 + 'em'
  }
})

const buttonStyle = computed(() => ({
  fontSize: boardSizePx.value / 450 + 'em'
}))

const scoreStyle = computed(() => ({
  fontSize: boardSizePx.value / 280 + 'em'
}))

const gameAwardsContainerStyle = computed(() => ({
  height: boardSizePx.value * 0.08 + 'px'
}))

const gameAwardStyle = computed(() => ({
  width: boardSizePx.value / 5 + 'px',
  fontSize: boardSizePx.value / 350 + 'em'
}))

const gameAwardLikeStyle = computed(() => ({
  height: boardSizePx.value / 21 + 'px'
}))

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
  } catch (e) {}
}

function persistState() {
  try {
    const state = {
      bestScore: { ...bestScore },
      awards: { ...awards }
    }
    document.cookie = JSON.stringify(state)
  } catch (e) {}
}

function fitBoardSizePx() {
  if (window.innerWidth < defBoardSizePx * 1.04) {
    boardSizePx.value = window.innerWidth * 0.96
  } else {
    boardSizePx.value = defBoardSizePx
  }
}

function startGame() {
  gameStarted.value = true
  score.value = 0
  showCollectAllAwards()
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
  const s = { score: score.value }
  gsap.to(s, {
    duration: 0.3,
    score: args.score,
    ease: 'none',
    onUpdate: () => {
      score.value = Math.floor(s.score)
    }
  })

  if (args.score > bestScore[size.value]) {
    const bs = { score: bestScore[size.value] }
    gsap.to(bs, {
      duration: 0.3,
      score: args.score,
      ease: 'none',
      onUpdate: () => {
        bestScore[size.value] = Math.floor(bs.score)
      }
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
  awards[gameAim.value].obtained = true
  persistState()

  const awardEl = awardRefs.value[gameAim.value]?.$el
  const gameAimEl = scoreContainerRef.value?.gameAimEl?.value ?? scoreContainerRef.value?.gameAimEl
  if (awardEl && gameAimEl) {
    const p1 = gameAimEl.getBoundingClientRect()
    const p2 = awardEl.getBoundingClientRect()
    const ws = p1.width / p2.width
    const hs = p1.height / p2.height
    const x = p1.left - p2.left + p1.width / 4
    const y = p1.top - p2.top + p1.height / 2

    const s = awardEl.style
    s['-webkit-transform'] = s.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + ws + ',' + hs + ')'
    s['-webkit-transition'] = s.transition = ''
    s.zIndex = 100
    requestAnimationFrame(() => {
      s['-webkit-transition'] = s.transition = 'all 2s'
      s['-webkit-transform'] = s.transform = ''
    })
  }
}

function showCollectAllAwards() {
  const el = collectAllAwardsRef.value
  if (el) {
    const s = el.style
    s['-webkit-animation'] = s.animation = ''
    requestAnimationFrame(() => {
      s['-webkit-animation'] = s.animation = 'collect-all-awards 10s'
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
      showCollectAllAwards()
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
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

.game-container {
  position: relative;
}

.game-awards-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 2%;
}

.collect-all-awards {
  text-align: center;
  width: 100%;
  opacity: 0;
  margin-top: 4px;
}

.collect-all-awards span {
  border: 1px solid #2c3e50;
  border-radius: 7% / 50%;
  padding: 0 3px;
}

.appearing {
  animation: appearing 1s;
}

@keyframes appearing {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes collect-all-awards {
  0% { opacity: 0; transform: translateY(20px); }
  60% { transform: translateY(20px); opacity: 0; }
  65% { opacity: 1; transform: translateY(0); }
  78% { transform: translateX(0); opacity: 1; }
  79% { transform: translateX(5px); opacity: 1; }
  80% { transform: translateX(-5px); opacity: 1; }
  81% { transform: translateX(5px); opacity: 1; }
  82% { transform: translateX(-5px); opacity: 1; }
  83% { transform: translateX(5px); opacity: 1; }
  84% { transform: translateX(-5px); opacity: 1; }
  85% { transform: translateX(5px); opacity: 1; }
  86% { transform: translateX(-5px); opacity: 1; }
  87% { transform: translateX(5px); opacity: 1; }
  88% { transform: translateX(-5px); opacity: 1; }
  89% { transform: translateX(0); opacity: 1; }
  99% { transform: translateX(0); opacity: 1; }
  100% { transform: translateY(20px); opacity: 0; }
}
</style>
