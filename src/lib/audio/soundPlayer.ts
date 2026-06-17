import {SOUND_URLS, type SoundId} from './soundMap'

interface PlayOptions {
    playbackRate?: number
    volume?: number
}

export function createSoundPlayer() {
    let ctx: AudioContext | null = null
    let masterGain: GainNode | null = null
    const buffers = new Map<SoundId, AudioBuffer>()
    let masterVolume = 0.6
    let muted = false

    function getContext(): AudioContext | null {
        if (typeof window === 'undefined') return null
        if (!ctx) {
            ctx = new AudioContext()
            masterGain = ctx.createGain()
            masterGain.connect(ctx.destination)
            masterGain.gain.value = masterVolume
        }
        return ctx
    }

    async function unlock(): Promise<void> {
        const audioCtx = getContext()
        if (!audioCtx) return
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume()
        }
    }

    async function preload(urls: Record<SoundId, string> = SOUND_URLS): Promise<void> {
        const audioCtx = getContext()
        if (!audioCtx) return

        await Promise.all(
            (Object.entries(urls) as [SoundId, string][]).map(async ([id, url]) => {
                try {
                    const response = await fetch(url)
                    if (!response.ok) return
                    const arrayBuffer = await response.arrayBuffer()
                    buffers.set(id, await audioCtx.decodeAudioData(arrayBuffer))
                } catch {
                    // Game continues without this clip.
                }
            }),
        )
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

        const audioCtx = getContext()
        if (!audioCtx || !masterGain) return

        const buffer = buffers.get(id)
        if (!buffer) return

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
        unlock,
        preload,
        play,
        setMasterVolume,
        setMuted,
    }
}

export type SoundPlayer = ReturnType<typeof createSoundPlayer>
