import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(rootDir, 'public', 'icons')

const mark = `
  <rect x="6" y="6" width="20" height="20" rx="5.5" stroke="white" stroke-width="1.75" fill="none"/>
  <circle cx="16" cy="16" r="5.5" stroke="white" stroke-width="1.75" fill="none"/>
  <path d="M13.5 18L16 14.5M18.5 18L16 14.5" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="22.5" cy="9.5" r="1.5" fill="white"/>
`

const gradient = `
  <defs>
    <linearGradient id="bg" x1="2" y1="30" x2="30" y2="2">
      <stop offset="0%" stop-color="#5B21B6"/>
      <stop offset="50%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#8B5CF6"/>
    </linearGradient>
  </defs>
`

function svgFor(kind) {
  if (kind === 'maskable') {
    // Full-bleed square + 20% padding so Adaptive Icon circle crop stays on the mark.
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
      ${gradient}
      <rect width="32" height="32" fill="url(#bg)"/>
      <g transform="translate(6.4 6.4) scale(0.6)">${mark}</g>
    </svg>`
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
    ${gradient}
    <rect width="32" height="32" rx="8" fill="url(#bg)"/>
    ${mark}
  </svg>`
}

function renderPng(svg, size) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0,0,0,0)',
  })
  return resvg.render().asPng()
}

mkdirSync(outDir, { recursive: true })

const anySvg = svgFor('any')
writeFileSync(join(outDir, 'icon-192.png'), renderPng(anySvg, 192))
writeFileSync(join(outDir, 'icon-512.png'), renderPng(anySvg, 512))
writeFileSync(join(outDir, 'icon-512-maskable.png'), renderPng(svgFor('maskable'), 512))

console.log('Wrote icon-192.png, icon-512.png, icon-512-maskable.png')
