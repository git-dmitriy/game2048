import {reactive, ref, watch, onMounted, type ComponentPublicInstance, type Ref} from 'vue'
import {useGamePreset} from './useGamePreset'
import {useAppComponents} from './useAppComponents'
import {useBoardLayout} from './useBoardLayout'
import {useAwardAnimation} from './useAwardAnimation'
import {useGamePersistence} from './useGamePersistence'
import {useAppGameSession} from './useAppGameSession'
import {useScoreDisplay} from './useScoreDisplay'
import {useStartGameHint} from './useStartGameHint'
import {useGameMeta} from './useGameMeta'
import {useAppSettings, type AppSettingsState} from './useAppSettings'
import {useAwards} from './useAwards'
import {getWinTile} from '../config/defaultPreset'
import {applyUiTheme, normalizeUiThemeId} from '../config/themes'
import {detectLocale, setAppLocale} from '../i18n'
import type {GameSession} from '../types/game'
import type {GameAimHeaderExpose, GameBoardExpose} from '../types/components'

export function useGameController(gameContainerEl: Ref<HTMLElement | null>) {
    const preset = useGamePreset()
    const C = useAppComponents()
    const {board, timing, features, input} = preset
    const defSize = board.defaultSize
    const listenOwnKeyEventsOnly = input.listenKeysOn === 'board'

    const {boardSizePx, sizingVars, layoutVars} = useBoardLayout(preset, gameContainerEl)
    const {play: playAwardAnimation} = useAwardAnimation(preset)
    const {sizes, awards, bestScore} = useGameMeta(preset)

    const appSettings = reactive<AppSettingsState>({
        size: defSize,
        theme: normalizeUiThemeId(preset.theme),
        locale: detectLocale(),
    })

    const savedSession = ref<GameSession | null>(null)
    const {loadState, persistState, flushPersistState, clearSession} = useGamePersistence(preset, {
        awards,
        bestScore,
        settings: appSettings,
        session: savedSession,
    })

    const gameAimHeaderRef = ref<ComponentPublicInstance<GameAimHeaderExpose> | null>(null)
    const gameRef = ref<ComponentPublicInstance<GameBoardExpose> | null>(null)

    const size = ref(defSize)
    const gameStarted = ref(false)
    const gameEnded = ref(false)
    const gameAim = ref(getWinTile(preset, defSize))
    const gameAimReached = ref(false)
    const isVisible = ref(false)

    const {score, scoreInc, onGameScore, resetScore} = useScoreDisplay(
        preset,
        size,
        bestScore,
        flushPersistState,
    )

    const {
        showSettings,
        openSettings,
        closeSettings,
        onSettingsSave,
    } = useAppSettings({
        preset,
        appSettings,
        size,
        gameAim,
        gameStarted,
        gameEnded,
        gameAimReached,
        resetScore,
        clearSession,
        flushPersistState,
    })

    const {
        onSessionUpdate,
        restoreSavedSession,
        syncSessionOnEnd,
        syncSessionOnAimReached,
    } = useAppGameSession({
        size,
        score,
        gameEnded,
        gameAimReached,
        savedSession,
        gameRef,
        persistState,
        flushPersistState,
        clearSession,
    })

    const startGameHintEnabled = features.startGameHint !== false
    const {highlightStart, onStart: dismissStartHint} = useStartGameHint(
        startGameHintEnabled,
        gameStarted,
        showSettings,
    )

    const {awardsList, bindAwardRef, handleAimReached} = useAwards({
        preset,
        awards,
        gameAim,
        gameAimHeaderRef,
        playAwardAnimation,
    })

    function startGame(): void {
        dismissStartHint()
        clearSession()
        gameEnded.value = false
        gameAimReached.value = false
        gameStarted.value = true
        resetScore()
    }

    function onGameStarted(): void {
        gameStarted.value = true
        gameEnded.value = false
    }

    function onGameEnded(): void {
        gameStarted.value = false
        gameEnded.value = true
        syncSessionOnEnd()
    }

    function onGameAimChanged(aim: number): void {
        gameAim.value = aim
    }

    function onGameAimReached(): void {
        gameAimReached.value = true
        syncSessionOnAimReached()
        handleAimReached()
    }

    watch(size, () => {
        gameEnded.value = false
    })

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

    return {
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
    }
}
