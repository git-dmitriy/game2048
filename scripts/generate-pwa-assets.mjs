import {mkdir, readFile} from 'node:fs/promises'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public')

const assets = [
    {
        input: path.join(publicDir, 'icon-maskable.svg'),
        output: path.join(publicDir, 'pwa-maskable-512x512.png'),
        width: 512,
        height: 512,
    },
]

await mkdir(publicDir, {recursive: true})

for (const asset of assets) {
    const svg = await readFile(asset.input)
    await sharp(svg)
        .resize(asset.width, asset.height)
        .png()
        .toFile(asset.output)
    console.log('Generated', path.relative(publicDir, asset.output))
}
