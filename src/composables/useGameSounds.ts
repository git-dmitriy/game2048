import {computed, type Ref} from 'vue'
import {createSoundPlayer} from '../lib/audio/soundPlayer'
import {mergePlaybackRate, SOUND_URLS} from '../lib/audio/soundMap'
import type {ChipCoord, GamePreset} from '../types/game'

export interface BoardSoundCallbacks {
    onMove?: () => void
    onMerge?: (consolidations: ChipCoord[]) => void
    onSpawn?: (count: number) => void
}

function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function isSoundFeatureEnabled(preset: GamePreset): boolean {
    const policy = preset.features.sounds
    return policy !== 'none' && policy !== false
}

export function useGameSounds(preset: GamePreset, soundEnabled: Ref<boolean>) {
    const player = createSoundPlayer()
    const volume = preset.features.soundVolume ?? 0.6
    player.setMasterVolume(volume)

    const isActive = computed(() =>
        isSoundFeatureEnabled(preset)
        && soundEnabled.value
        && !prefersReducedMotion(),
    )

    function activate(): Promise<void> {
        if (!isSoundFeatureEnabled(preset)) return Promise.resolve()
        return player.activate(SOUND_URLS)
    }

    function playMove(): void {
        if (!isActive.value) return
        player.play('move')
    }

    function playMerge(consolidations: ChipCoord[]): void {
        if (!isActive.value || consolidations.length === 0) return
        const maxValue = Math.max(...consolidations.map((chip) => chip.value))
        player.play('merge', {playbackRate: mergePlaybackRate(maxValue)})
    }

    function playSpawn(count: number): void {
        if (!isActive.value || count <= 0) return
        player.play('spawn')
    }

    function playWin(): void {
        if (!isActive.value) return
        player.play('win')
    }

    function playGameOver(): void {
        if (!isActive.value) return
        player.play('gameOver')
    }

    function playNewGame(): void {
        if (!isActive.value) return
        player.play('spawn', {volume: 0.8})
    }

    const boardCallbacks: BoardSoundCallbacks = {
        onMove: playMove,
        onMerge: playMerge,
        onSpawn: playSpawn,
    }

    return {
        activate,
        playWin,
        playGameOver,
        playNewGame,
        boardCallbacks,
    }
}
