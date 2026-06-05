<template>
  <div
      ref="appEl"
      class="main-container appearing"
      :style="[sizingVars, layoutVars, { visibility: isVisible ? 'visible' : 'hidden' }]"
  >
    <slot
        name="header"
        :score="score"
        :score-inc="scoreInc"
        :best-score="bestScore[size]"
        :game-aim="gameAim"
        :game-aim-reached="gameAimReached"
    />

    <slot
        name="score"
        :score="score"
        :score-inc="scoreInc"
        :best-score="bestScore[size]"
        :game-aim="gameAim"
        :game-aim-reached="gameAimReached"
    >
      <component
          :is="C.ScoreContainer"
          ref="scoreContainerRef"
          :score="score"
          :score-inc="scoreInc"
          :best-score="bestScore[size]"
          :game-aim="gameAim"
          :game-aim-reached="gameAimReached"
      />
    </slot>

    <slot
        name="controls"
        :game-started="gameStarted"
        :show-settings="showSettings"
        @open-settings="openSettings"
        @start="startGame"
        @end="gameStarted = false"
    >
      <component
          :is="C.GameControls"
          :game-started="gameStarted"
          @open-settings="openSettings"
          @start="startGame"
          @end="gameStarted = false"
      />
    </slot>

    <slot
        name="settings"
        :visible="showSettings"
        :sizes="sizes"
        :board-size="size"
        :color-theme="appSettings.theme"
        :game-started="gameStarted"
        @close="closeSettings"
        @save="onSettingsSave"
    >
      <AppSettings
          :visible="showSettings"
          :sizes="sizes"
          :board-size="size"
          :color-theme="appSettings.theme"
          :game-started="gameStarted"
          @close="closeSettings"
          @save="onSettingsSave"
      />
    </slot>

    <div ref="gameContainerEl" class="game-container">
      <slot name="overlay" :game-ended="gameEnded">
        <component :is="C.GameOverlay" :visible="gameEnded"/>
      </slot>

      <slot
          name="board"
          :size="size"
          :game-started="gameStarted"
          :board-size-px="boardSizePx"
      >
        <component
            :is="C.GameBoard"
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
      </slot>
    </div>

    <slot
        v-if="features.awards"
        name="awards"
        :awards-list="awardsList"
        :set-award-ref="setAwardRef"
    >
      <div class="game-awards-container">
        <component
            :is="C.GameAward"
            v-for="a in awardsList"
            :ref="(el) => setAwardRef(el, a.aim)"
            :key="a.aim"
            :award="a"
        />
      </div>
    </slot>

    <slot
        v-if="features.collectAllBanner"
        name="collect-all"
        :all-obtained="allAwardsObtained"
        :replay-banner="replayCollectAllBanner"
    >
      <component
          :is="C.CollectAllBanner"
          v-show="!allAwardsObtained"
          ref="collectAllBannerRef"
      />
    </slot>

    <slot name="footer"/>
  </div>
</template>

<script setup>
import {ref, reactive, computed, watch, onMounted, nextTick} from 'vue'
import {gsap} from 'gsap'
import {useGamePreset} from './composables/useGamePreset.js'
import {useBoardLayout} from './composables/useBoardLayout.js'
import {useAppComponents} from './composables/useAppComponents.js'
import {useAwardAnimation} from './composables/useAwardAnimation.js'
import {useGamePersistence} from './composables/useGamePersistence.js'
import {getBoardSizes, getWinTile} from './config/defaultPreset.js'
import {applyUiTheme, normalizeUiThemeId} from './config/themes.js'
import AppSettings from './components/AppSettings.vue'

const preset = useGamePreset()
const C = useAppComponents()
const {board, timing, features, input} = preset
const gameContainerEl = ref(null)
const {boardSizePx, sizingVars, layoutVars} = useBoardLayout(preset, gameContainerEl)
const {play: playAwardAnimation} = useAwardAnimation(preset)

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

const appSettings = reactive({
  size: defSize,
  theme: normalizeUiThemeId(preset.theme),
})

const {loadState, persistState} = useGamePersistence(preset, {awards, bestScore, settings: appSettings})

const scoreContainerRef = ref(null)
const gameRef = ref(null)
const collectAllBannerRef = ref(null)
const awardRefs = ref({})

const size = ref(defSize)
const showSettings = ref(false)
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

function getGameAimElement() {
  const exposed = scoreContainerRef.value?.gameAimEl
  return exposed?.value ?? exposed ?? null
}

function replayCollectAllBanner() {
  collectAllBannerRef.value?.replay?.()
}

function openSettings() {
  showSettings.value = true
}

function closeSettings() {
  showSettings.value = false
}

function onSettingsSave({boardSize, colorTheme, resetGame}) {
  if (resetGame) {
    gameStarted.value = false
    gameEnded.value = false
    gameAimReached.value = false
    score.value = 0
  }

  size.value = boardSize
  appSettings.size = boardSize
  appSettings.theme = colorTheme
  applyUiTheme(colorTheme)
  gameAim.value = getWinTile(preset, boardSize)
  showSettings.value = false
  persistState()
}

function startGame() {
  gameStarted.value = true
  score.value = 0
  if (features.collectAllBanner) {
    replayCollectAllBanner()
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

  playAwardAnimation({
    awardEl: awardRefs.value[gameAim.value]?.$el,
    sourceEl: getGameAimElement(),
  })
}

watch(size, () => {
  gameEnded.value = false
})

onMounted(() => {
  loadState()
  const savedSize = sizes.includes(appSettings.size) ? appSettings.size : defSize
  size.value = savedSize
  appSettings.size = savedSize
  gameAim.value = getWinTile(preset, savedSize)
  applyUiTheme(appSettings.theme)
  requestAnimationFrame(() => {
    isVisible.value = true
    if (features.collectAllBanner) {
      replayCollectAllBanner()
    }
  })
})
</script>

<style scoped>
.main-container {
  --board-size: clamp(
      var(--board-min),
      min(
          var(--board-width-cap),
          calc((100dvh - var(--layout-vertical-padding)) / var(--vertical-overhead)),
          calc((100vh - var(--layout-vertical-padding)) / var(--vertical-overhead)),
          var(--board-max)
      ),
      var(--board-max)
  );
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 2%;
  width: var(--board-size);
  max-width: 100vw;
  transform: translateZ(0);
}

.game-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  flex-shrink: 0;
}

.game-awards-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 2%;
  height: var(--awards-height);
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
</style>
