<template>
  <div
      ref="appEl"
      class="main-container appearing"
      :style="[sizingVars, layoutVars, { visibility: isVisible ? 'visible' : 'hidden' }]"
  >
    <div class="layout-row layout-row-aim">
      <slot
          name="aim"
          :game-aim="gameAim"
          :game-aim-reached="gameAimReached"
      >
        <component
            :is="C.GameAimHeader"
            ref="gameAimHeaderRef"
            :game-aim="gameAim"
            :game-aim-reached="gameAimReached"
        />
      </slot>
    </div>

    <div class="layout-row layout-row-toolbar">
      <slot
          name="toolbar"
          :score="score"
          :score-inc="scoreInc"
          :best-score="bestScore[size]"
          :game-started="gameStarted"
          :highlight-start="highlightStart"
          @open-settings="openSettings"
          @start="startGame"
          @end="gameStarted = false"
      >
        <component
            :is="C.GameToolbar"
            :score="score"
            :score-inc="scoreInc"
            :best-score="bestScore[size]"
            :game-started="gameStarted"
            :highlight-start="highlightStart"
            @open-settings="openSettings"
            @start="startGame"
            @end="gameStarted = false"
        />
      </slot>
    </div>

    <div class="layout-row layout-row-board">
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
              @session-update="onSessionUpdate"
          />
        </slot>
      </div>
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
        name="settings"
        :visible="showSettings"
        :sizes="sizes"
        :board-size="size"
        :color-theme="appSettings.theme"
        :locale="appSettings.locale"
        :game-started="gameStarted"
        @close="closeSettings"
        @save="onSettingsSave"
    >
      <AppSettings
          :visible="showSettings"
          :sizes="sizes"
          :board-size="size"
          :color-theme="appSettings.theme"
          :locale="appSettings.locale"
          :game-started="gameStarted"
          @close="closeSettings"
          @save="onSettingsSave"
      />
    </slot>

    <PwaUpdatePrompt/>
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
import {useStartGameHint} from './composables/useStartGameHint.js'
import {getBoardSizes, getWinTile} from './config/defaultPreset.js'
import {applyUiTheme, normalizeUiThemeId} from './config/themes.js'
import {detectLocale, setAppLocale} from './i18n/index.js'
import {isValidGameSession} from './lib/gameSession.js'
import AppSettings from './components/AppSettings.vue'
import PwaUpdatePrompt from './components/PwaUpdatePrompt.vue'

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
  locale: detectLocale(),
})

const savedSession = ref(null)
const {loadState, persistState, flushPersistState, clearSession} = useGamePersistence(preset, {
  awards,
  bestScore,
  settings: appSettings,
  session: savedSession,
})

const gameAimHeaderRef = ref(null)
const gameRef = ref(null)
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

const startGameHintEnabled = features.startGameHint !== false
const {highlightStart, onStart: dismissStartHint} = useStartGameHint(
    startGameHintEnabled,
    gameStarted,
    showSettings,
)

const awardsList = computed(() => Object.values(awards))

function setAwardRef(el, aim) {
  if (el) {
    awardRefs.value[aim] = el
  }
}

function getGameAimElement() {
  const exposed = gameAimHeaderRef.value?.gameAimEl
  return exposed?.value ?? exposed ?? null
}

function openSettings() {
  showSettings.value = true
}

function closeSettings() {
  showSettings.value = false
}

function updateSavedSession(overrides = {}) {
  if (!savedSession.value) return

  savedSession.value = {
    ...savedSession.value,
    size: size.value,
    score: score.value,
    gameEnded: gameEnded.value,
    gameAimReached: gameAimReached.value,
    ...overrides,
  }
}

function onSessionUpdate({board, score: sessionScore}) {
  savedSession.value = {
    size: size.value,
    score: sessionScore,
    board,
    gameEnded: gameEnded.value,
    gameAimReached: gameAimReached.value,
  }
  persistState()
}

function onSettingsSave({boardSize, colorTheme, locale, resetGame}) {
  if (resetGame) {
    gameStarted.value = false
    gameEnded.value = false
    gameAimReached.value = false
    score.value = 0
    clearSession()
  }

  size.value = boardSize
  appSettings.size = boardSize
  appSettings.theme = colorTheme
  appSettings.locale = setAppLocale(locale)
  applyUiTheme(colorTheme)
  gameAim.value = getWinTile(preset, boardSize)
  showSettings.value = false
  flushPersistState()
}

function startGame() {
  dismissStartHint()
  clearSession()
  gameEnded.value = false
  gameAimReached.value = false
  gameStarted.value = true
  score.value = 0
}

function onGameStarted() {
  gameStarted.value = true
  gameEnded.value = false
}

function onGameEnded() {
  gameStarted.value = false
  gameEnded.value = true
  updateSavedSession({gameEnded: true})
  flushPersistState()
}

function onGameScore(args) {
  let bestScoreUpdated = false

  if (features.scoreAnimation !== 'gsap') {
    score.value = args.score
    if (features.bestScorePerSize && args.score > bestScore[size.value]) {
      bestScore[size.value] = args.score
      bestScoreUpdated = true
    }
    scoreInc.value = args.scoreInc + '+'
    nextTick(() => {
      scoreInc.value = ''
    })
    if (bestScoreUpdated) flushPersistState()
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
      onComplete: () => flushPersistState(),
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
  updateSavedSession({gameAimReached: true})
  flushPersistState()

  if (!features.awards) return

  playAwardAnimation({
    awardEl: awardRefs.value[gameAim.value]?.$el,
    sourceEl: getGameAimElement(),
  })
}

watch(size, () => {
  gameEnded.value = false
})

async function restoreSavedSession() {
  const session = savedSession.value
  if (!session || !isValidGameSession(session, size.value)) {
    if (session) clearSession()
    return
  }

  score.value = session.score
  gameEnded.value = session.gameEnded
  gameAimReached.value = session.gameAimReached

  await nextTick()

  const restored = gameRef.value?.restoreSession(
      {board: session.board, score: session.score},
      {interactive: !session.gameEnded},
  )

  if (!restored) {
    clearSession()
  }
}

onMounted(async () => {
  loadState()
  const savedSize = sizes.includes(appSettings.size) ? appSettings.size : defSize
  size.value = savedSize
  appSettings.size = savedSize
  appSettings.locale = setAppLocale(appSettings.locale)
  gameAim.value = getWinTile(preset, savedSize)
  applyUiTheme(appSettings.theme)
  await restoreSavedSession()
  requestAnimationFrame(() => {
    isVisible.value = true
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
  gap: 1rem;
  margin: 0 auto;
  padding: 2%;
  width: var(--board-size);
  max-width: 100vw;
  transform: translateZ(0);
}

.layout-row {
  width: 100%;
  flex-shrink: 0;
}

.layout-row-toolbar {
  height: var(--toolbar-height);
}

.layout-row-board {
  flex-shrink: 0;
}

.game-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.game-awards-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
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
