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
              :board-sound-callbacks="boardSoundCallbacks"
              :on-sound-unlock="activateSounds"
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
        :set-award-ref="bindAwardRef"
    >
      <div class="game-awards-container">
        <component
            :is="C.GameAward"
            v-for="a in awardsList"
            :ref="bindAwardRef(a.aim)"
            :key="a.aim"
            :award="a"
        />
      </div>
    </slot>

    <div class="layout-row layout-row-copyright">
      <slot name="copyright">
        <AppCopyright/>
      </slot>
    </div>

    <slot
        name="settings"
        :visible="showSettings"
        :sizes="sizes"
        :board-size="size"
        :color-theme="appSettings.theme"
        :locale="appSettings.locale"
        :sound-enabled="appSettings.soundEnabled"
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
          :sound-enabled="appSettings.soundEnabled"
          :game-started="gameStarted"
          @close="closeSettings"
          @save="onSettingsSave"
      />
    </slot>

    <PwaUpdatePrompt/>
    <PwaInstallPrompt/>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {useGameController} from './composables/useGameController'
import AppSettings from './components/AppSettings.vue'
import AppCopyright from './components/AppCopyright.vue'
import PwaUpdatePrompt from './components/PwaUpdatePrompt.vue'
import PwaInstallPrompt from './components/PwaInstallPrompt.vue'

const gameContainerEl = ref<HTMLElement | null>(null)

const {
  C,
  timing,
  features,
  listenOwnKeyEventsOnly,
  boardSizePx,
  sizingVars,
  layoutVars,
  isVisible,
  score,
  scoreInc,
  bestScore,
  size,
  gameStarted,
  gameEnded,
  gameAim,
  gameAimReached,
  highlightStart,
  awardsList,
  bindAwardRef,
  showSettings,
  sizes,
  appSettings,
  gameAimHeaderRef,
  gameRef,
  openSettings,
  closeSettings,
  onSettingsSave,
  startGame,
  onGameStarted,
  onGameEnded,
  onGameScore,
  onGameAimChanged,
  onGameAimReached,
  onSessionUpdate,
  boardSoundCallbacks,
  activateSounds,
} = useGameController(gameContainerEl)
</script>

<style scoped>
.main-container {
  --board-size: clamp(
      var(--board-min),
      min(
          var(--board-width-cap),
          100%,
          calc((100dvh - var(--layout-fixed-chrome)) / var(--vertical-overhead)),
          calc((100vh - var(--layout-fixed-chrome)) / var(--vertical-overhead)),
          var(--board-max)
      ),
      var(--board-max)
  );
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  margin: 0 auto;
  padding: 2%;
  width: var(--board-size);
  max-width: 100%;
  max-height: 100%;
  height: 100%;
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

.layout-row-copyright {
  min-height: 1.25em;
}

.appearing {
  animation: appearing var(--motion-slow) var(--motion-ease);
}
</style>
