import {type MaybeRefOrGetter, toValue} from 'vue'
import {createSwipeListener} from '../lib/swipe'
import type {MoveDirection} from '../types/game'

const KEY_MAP: Record<number, MoveDirection> = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
}

interface BoardInputOptions {
    boardEl: MaybeRefOrGetter<HTMLElement | null>
    listenOwnKeyEventsOnly: MaybeRefOrGetter<boolean>
    swipeSensitivity: number
    inputPaused?: MaybeRefOrGetter<boolean>
    onAudioUnlock?: () => void
    onAudioWarmUp?: () => void
}

export function useBoardInput({
                                  boardEl,
                                  listenOwnKeyEventsOnly,
                                  swipeSensitivity,
                                  inputPaused,
                                  onAudioUnlock,
                                  onAudioWarmUp,
                              }: BoardInputOptions) {
    let keydownCleanup: (() => void) | null = null
    let swipeDetach: (() => void) | null = null

    function isInputPaused(): boolean {
        return toValue(inputPaused) === true
    }

    function prepareAudio(): void {
        if (isInputPaused()) return
        onAudioUnlock?.()
        onAudioWarmUp?.()
    }

    function runKeyboardControl(doGameMove: (direction: MoveDirection) => void): void {
        const listenKeysOn = toValue(listenOwnKeyEventsOnly) ? toValue(boardEl) : document
        if (!listenKeysOn) return

        const handler = (e: Event) => {
            const ke = e as KeyboardEvent
            const direction = KEY_MAP[ke.keyCode]
            if (direction == null) return
            if (isInputPaused()) return
            e.preventDefault()
            prepareAudio()
            doGameMove(direction)
        }

        listenKeysOn.addEventListener('keydown', handler)
        keydownCleanup = () => {
            listenKeysOn.removeEventListener('keydown', handler)
        }
    }

    function runTouchControl(doGameMove: (direction: MoveDirection) => void): void {
        const swipe = createSwipeListener((direction) => {
            if (isInputPaused()) return
            doGameMove(direction)
        }, {
            sensitivity: swipeSensitivity,
            onTouchStart: prepareAudio,
        })
        const el = toValue(boardEl)
        if (el) {
            swipe.attach(el)
            swipeDetach = () => swipe.detach(el)
        }
    }

    function attach(doGameMove: (direction: MoveDirection) => void): void {
        detach()
        runKeyboardControl(doGameMove)
        runTouchControl(doGameMove)
    }

    function detach(): void {
        if (keydownCleanup) {
            keydownCleanup()
            keydownCleanup = null
        }
        if (swipeDetach) {
            swipeDetach()
            swipeDetach = null
        }
    }

    return {attach, detach}
}
