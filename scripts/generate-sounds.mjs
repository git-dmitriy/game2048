import {mkdir, writeFile} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../public/sounds')
const SAMPLE_RATE = 44100

function writeWav(samples) {
    const dataSize = samples.length * 2
    const buffer = Buffer.alloc(44 + dataSize)

    buffer.write('RIFF', 0)
    buffer.writeUInt32LE(36 + dataSize, 4)
    buffer.write('WAVE', 8)
    buffer.write('fmt ', 12)
    buffer.writeUInt32LE(16, 16)
    buffer.writeUInt16LE(1, 20)
    buffer.writeUInt16LE(1, 22)
    buffer.writeUInt32LE(SAMPLE_RATE, 24)
    buffer.writeUInt32LE(SAMPLE_RATE * 2, 28)
    buffer.writeUInt16LE(2, 32)
    buffer.writeUInt16LE(16, 34)
    buffer.write('data', 36)
    buffer.writeUInt32LE(dataSize, 40)

    for (let i = 0; i < samples.length; i++) {
        const clamped = Math.max(-1, Math.min(1, samples[i]))
        buffer.writeInt16LE(Math.floor(clamped * 32767), 44 + i * 2)
    }

    return buffer
}

function renderTone({frequency, duration, volume = 0.25, type = 'sine', decay = 10}) {
    const length = Math.floor(duration * SAMPLE_RATE)
    const samples = new Float32Array(length)

    for (let i = 0; i < length; i++) {
        const t = i / SAMPLE_RATE
        const envelope = Math.exp(-t * decay)
        const phase = 2 * Math.PI * frequency * t
        let sample = 0

        if (type === 'sine') {
            sample = Math.sin(phase)
        } else if (type === 'triangle') {
            sample = (2 / Math.PI) * Math.asin(Math.sin(phase))
        } else if (type === 'noise') {
            sample = Math.random() * 2 - 1
        }

        samples[i] = sample * envelope * volume
    }

    return samples
}

function mix(...parts) {
    const maxLength = Math.max(...parts.map((part) => part.length))
    const mixed = new Float32Array(maxLength)

    for (const part of parts) {
        for (let i = 0; i < part.length; i++) {
            mixed[i] += part[i]
        }
    }

    return mixed
}

function renderMove() {
    return renderTone({frequency: 180, duration: 0.06, volume: 0.12, type: 'triangle', decay: 18})
}

function renderMerge() {
    return renderTone({frequency: 320, duration: 0.1, volume: 0.28, type: 'sine', decay: 12})
}

function renderSpawn() {
    return renderTone({frequency: 520, duration: 0.05, volume: 0.16, type: 'sine', decay: 16})
}

function renderWin() {
    const notes = [523.25, 659.25, 783.99]
    const parts = notes.map((frequency, index) => {
        const offset = Math.floor(index * 0.07 * SAMPLE_RATE)
        const tone = renderTone({frequency, duration: 0.18, volume: 0.2, decay: 6})
        const padded = new Float32Array(offset + tone.length)
        padded.set(tone, offset)
        return padded
    })
    return mix(...parts)
}

function renderGameOver() {
    const start = renderTone({frequency: 440, duration: 0.16, volume: 0.22, decay: 4})
    const end = renderTone({frequency: 220, duration: 0.28, volume: 0.24, decay: 3})
    const gap = Math.floor(0.04 * SAMPLE_RATE)
    const combined = new Float32Array(start.length + gap + end.length)
    combined.set(start, 0)
    combined.set(end, start.length + gap)
    return combined
}

const SOUNDS = {
    'move.wav': renderMove(),
    'merge.wav': renderMerge(),
    'spawn.wav': renderSpawn(),
    'win.wav': renderWin(),
    'game-over.wav': renderGameOver(),
}

await mkdir(OUT_DIR, {recursive: true})

for (const [filename, samples] of Object.entries(SOUNDS)) {
    await writeFile(join(OUT_DIR, filename), writeWav(samples))
}

console.log(`Generated ${Object.keys(SOUNDS).length} sounds in public/sounds/`)
