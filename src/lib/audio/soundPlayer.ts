import {SOUND_URLS, type SoundId} from './soundMap'

const WARMUP_TIMEOUT_MS = 4000

interface PlayOptions {
    playbackRate?: number
    volume?: number
}

function warmupWithTimeout(promise: Promise<void>): Promise<void> {
    return Promise.race([
        promise,
        new Promise<void>((resolve) => {
            setTimeout(resolve, WARMUP_TIMEOUT_MS)
        }),
    ])
}

export function createSoundPlayer() {
    let ctx: AudioContext | null = null
    let masterGain: GainNode | null = null
    const buffers = new Map<SoundId, AudioBuffer>()
    let masterVolume = 0.6
    let muted = false
    let activated = false
    let warmUpPromise: Promise<void> | null = null

    function initContext(): AudioContext | null {
        if (typeof window === 'undefined') return null
        if (!ctx) {
            ctx = new AudioContext()
            masterGain = ctx.createGain()
            masterGain.connect(ctx.destination)
            masterGain.gain.value = masterVolume
        }
        return ctx
    }

    function unlockSync(): void {
        const audioCtx = initContext()
        if (!audioCtx) return

        if (import.meta.env.DEV) {
            console.debug('AudioContext state before resume:', audioCtx.state)
        }

        if (audioCtx.state === 'suspended') {
            void audioCtx.resume()
        }

        if (import.meta.env.DEV) {
            console.debug('AudioContext resume requested, state:', audioCtx.state)
        }
    }

    async function loadBuffers(
        audioCtx: AudioContext,
        urls: Record<SoundId, string>,
    ): Promise<void> {
        await Promise.all(
            (Object.entries(urls) as [SoundId, string][]).map(async ([id, url]) => {
                if (buffers.has(id)) return

                try {
                    const response = await fetch(url)
                    if (!response.ok) {
                        if (import.meta.env.DEV) {
                            console.warn(`Sound fetch failed: ${url} (${response.status})`)
                        }
                        return
                    }
                    const arrayBuffer = await response.arrayBuffer()
                    const copy = arrayBuffer.slice(0)
                    buffers.set(id, await audioCtx.decodeAudioData(copy))
                } catch (error) {
                    if (import.meta.env.DEV) {
                        console.warn(`Sound load failed: ${url}`, error)
                    }
                }
            }),
        )
    }

    async function warmUp(urls: Record<SoundId, string> = SOUND_URLS): Promise<void> {
        if (activated) return
        if (warmUpPromise) return warmUpPromise

        warmUpPromise = warmupWithTimeout((async () => {
            const audioCtx = initContext()
            if (!audioCtx) return

            await loadBuffers(audioCtx, urls)

            if (import.meta.env.DEV) {
                console.debug('Sound buffers loaded:', buffers.size)
            }

            if (buffers.size === 0) {
                if (import.meta.env.DEV) {
                    console.warn('Sound warm-up skipped: no buffers loaded')
                }
                return
            }

            activated = true
        })())

        try {
            await warmUpPromise
        } catch {
            warmUpPromise = null
        }

        if (!activated) {
            warmUpPromise = null
        }
    }

    function isReady(): boolean {
        return activated && buffers.size > 0
    }

    function setMasterVolume(volume: number): void {
        masterVolume = Math.min(1, Math.max(0, volume))
        if (masterGain) {
            masterGain.gain.value = masterVolume
        }
    }

    function setMuted(isMuted: boolean): void {
        muted = isMuted
    }

    function play(id: SoundId, options: PlayOptions = {}): void {
        if (muted) return

        const buffer = buffers.get(id)
        if (!buffer) return

        const audioCtx = ctx
        if (!audioCtx || !masterGain) return

        if (audioCtx.state === 'suspended') {
            void audioCtx.resume()
        }

        const source = audioCtx.createBufferSource()
        source.buffer = buffer
        source.playbackRate.value = options.playbackRate ?? 1

        const gain = audioCtx.createGain()
        gain.gain.value = options.volume ?? 1
        source.connect(gain)
        gain.connect(masterGain)
        source.start()
    }

    return {
        unlockSync,
        warmUp,
        isReady,
        play,
        setMasterVolume,
        setMuted,
    }
}

export type SoundPlayer = ReturnType<typeof createSoundPlayer>
